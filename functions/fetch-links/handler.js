import aws from 'aws-sdk'
import { Mastodon } from 'megalodon'
import fb from 'fb'
import moment from 'moment-timezone'
import cloudinary from 'cloudinary'
import { bestScheduledTweets } from './best-scheduled-tweets/index.js'
import { autoRetrieveAccessToken } from './best-scheduled-tweets/utils/fb.js'
import { uploadImagesToCloudinary } from './uploadImagesToCloudinary.js'
import { addCampaignUrls } from './addCampaignUrls.js'
import { createBlacklistManager, addLinksToBlacklist } from './blacklistManager.js'
import { createFallbackImageClient } from './best-scheduled-tweets/fallbackImage.js'

export async function fetchLinks (event) {
  try {
    const s3 = new aws.S3()
    const dataBucket = process.env.S3_DATA_BUCKET_NAME
    const blacklistManager = createBlacklistManager(s3, dataBucket)

    const mastodonClient = new Mastodon(
      process.env.MASTODON_BASE_URL,
      process.env.MASTODON_ACCESS_TOKEN
    )

    const fbApp = autoRetrieveAccessToken(
      new fb.Facebook({
        version: 'v3.2',
        appId: process.env.FACEBOOK_APP_ID,
        appSecret: process.env.FACEBOOK_APP_SECRET
      })
    )

    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET
    })

    const fallbackImageClient = createFallbackImageClient(process.env.UNSPLASH_ACCESS_KEY)

    const now = moment.tz('Etc/UTC')
    const referenceMoment = now
      .clone()
      .subtract('1', 'week')
      .startOf('day')

    const nextIssue = event.NextIssue.number
    const campaignName = `fullstackBulletin-${nextIssue}`

    console.log('Creating campaign', campaignName)

    const blacklist = await blacklistManager.get(campaignName)
    console.log('Loaded blacklist', blacklist)

    const blacklistedUrls = blacklist.map(link => link.url)
    console.log('Generated blacklisted urls', blacklistedUrls)

    const links = await bestScheduledTweets({
      mastodonClient,
      fbApp,
      fallbackImageClient,
      referenceMoment,
      numResults: 30,
      blacklistedUrls
    })
    console.log('Retrieved issue links', links)

    const imageUploader = uploadImagesToCloudinary(cloudinary, process.env.CLOUDINARY_FOLDER)
    const linksWithImages = await imageUploader(links)
    console.log('Uploaded images', linksWithImages)

    const linksWithCampaignUrls = addCampaignUrls(campaignName)(linksWithImages)

    // updates blacklist
    const newBlacklist = addLinksToBlacklist(blacklist, links, campaignName)
    await blacklistManager.save(newBlacklist)
    console.log('Saved new blacklist', newBlacklist)

    return linksWithCampaignUrls
  } catch (err) {
    console.error('Error fetching links', err)
    throw err
  }
}
