/* eslint "no-console": "off" */

import aws from 'aws-sdk'
import { Mastodon } from 'megalodon'
import fb from 'fb'
import moment from 'moment-timezone'
import axios from 'axios'
import cloudinary from 'cloudinary'
import { bookOfTheWeek } from 'fullstack-book-of-the-week'
import { bestScheduledTweets } from './best-scheduled-tweets/index.js'
import { autoRetrieveAccessToken } from './best-scheduled-tweets/utils/fb.js'
import { persistedMemoize } from './persistedMemoize.js'
import { uploadImagesToCloudinary } from './uploadImagesToCloudinary.js'
import { addCampaignUrls } from './addCampaignUrls.js'
import { createCampaignFactory } from './mailchimpCampaign.js'
import { createBlacklistManager, addLinksToBlacklist } from './blacklistManager.js'
import { createFallbackImageClient } from './best-scheduled-tweets/fallbackImage.js'

export const createIssue = async (event, context) => {
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
    const scheduleFor = now
      .clone()
      .add(1, 'week')
      .day(1) // be sure to set it to next monday
      .hours(17)
      .minutes(0)
      .seconds(0)
      .milliseconds(0)
    const referenceMoment = now
      .clone()
      .subtract('1', 'week')
      .startOf('day')

    const weekNumber = now.format('W')
    const year = now.format('YYYY')
    const campaignName = `fullstackBulletin-${weekNumber}-${year}`

    console.log('Creating campaign', campaignName)

    const blacklist = await blacklistManager.get(campaignName)
    console.log('Loaded blacklist', blacklist)

    const blacklistedUrls = blacklist.map(link => link.url)
    console.log('Generated blacklisted urls', blacklistedUrls)

    const quote = event.Quote
    console.log('Loaded quote of the week', quote)

    const book = bookOfTheWeek()(weekNumber)
    console.log('Loaded book of the week', book)

    const getLinks = persistedMemoize(process.env.CACHE_DIR, 'bst_')(bestScheduledTweets)
    const links = await getLinks({
      mastodonClient,
      fbApp,
      fallbackImageClient,
      referenceMoment,
      maxTweetsPerUser: 200,
      numResults: 7,
      blacklistedUrls
    })
    console.log('Retrieved issue links', links)

    const imageUploader = uploadImagesToCloudinary(cloudinary, process.env.CLOUDINARY_FOLDER)
    const linksWithImages = await imageUploader(links)
    console.log('Uploaded images', linksWithImages)

    const linksWithCampaignUrls = addCampaignUrls(campaignName)(linksWithImages)

    const httpClient = axios.create()

    const createCampaign = createCampaignFactory(httpClient, process.env.MAILCHIMP_API_KEY)

    const campaignSettings = {
      listId: process.env.MAILCHIMP_LIST_ID,
      templateId: parseInt(process.env.MAILCHIMP_TEMPLATE_ID, 10),
      referenceTime: referenceMoment,
      from: process.env.MAILCHIMP_FROM_EMAIL,
      fromName: process.env.MAILCHIMP_FROM_NAME,
      replyTo: process.env.MAILCHIMP_REPLY_TO_EMAIL,
      campaignName,
      weekNumber,
      year,
      scheduleTime: scheduleFor.format(),
      testEmails: process.env.MAILCHIMP_TEST_EMAILS.split(',')
    }
    console.log('Creating mailchimp campaing', campaignSettings)

    await createCampaign(quote, book, linksWithCampaignUrls, campaignSettings)
    console.log('Mailchimp campaign created')

    // updates blacklist
    const newBlacklist = addLinksToBlacklist(blacklist, links, campaignName)
    await blacklistManager.save(newBlacklist)
    console.log('Saved new blacklist', newBlacklist)

    return { quote, book, linksWithCampaignUrls, newBlacklist }
  } catch (err) {
    console.error(err, err.stack)
    throw err
  }
}

export default { createIssue }
