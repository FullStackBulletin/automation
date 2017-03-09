/* eslint "no-console": "off" */

import sourceMapSupport from 'source-map-support';
import { S3 } from 'aws-sdk';
import Twitter from 'twitter';
import { Facebook } from 'fb';
import moment from 'moment-timezone';
import axios from 'axios';
import cloudinary from 'cloudinary';
import { bestScheduledTweets } from 'best-scheduled-tweets';
import { autoRetrieveAccessToken } from 'best-scheduled-tweets/src/utils/fb';
import { techQuoteOfTheWeek } from 'tech-quote-of-the-week';
import { bookOfTheWeek } from 'fullstack-book-of-the-week';
import { persistedMemoize } from './persistedMemoize';
import { uploadImagesToCloudinary } from './uploadImagesToCloudinary';
import { addCampaignUrls } from './addCampaignUrls';
import { createCampaignFactory } from './mailchimpCampaign';
import { createBlacklistManager, addLinksToBlacklist } from './blacklistManager';

sourceMapSupport.install();

export const createIssue = async (event, context, callback) => {
  try {
    const s3 = new S3();
    const dataBucket = process.env.S3_DATA_BUCKET_NAME;
    const blacklistManager = createBlacklistManager(s3, dataBucket);

    const twitterClient = new Twitter({
      consumer_key: process.env.TWITTER_CONSUMER_KEY,
      consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
      access_token_key: process.env.TWITTER_ACCESS_TOKEN_KEY,
      access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
    });

    const fbApp = autoRetrieveAccessToken(new Facebook({
      version: 'v2.7',
      appId: process.env.FACEBOOK_APP_ID,
      appSecret: process.env.FACEBOOK_APP_SECRET,
    }));

    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });

    const now = moment.tz('Etc/UTC');
    const scheduleFor = now.clone()
      .add(1, 'week')
      .day(1) // be sure to set it to next monday
      .hours(18)
      .minutes(0)
      .seconds(0)
      .milliseconds(0);
    const referenceMoment = now.clone().subtract('1', 'week').startOf('day');
    const screenNames = process.env.TWITTER_SCREEN_NAMES.split(',');
    const weekNumber = now.format('w');
    const year = now.format('YYYY');
    const campaignName = `fullstackBulletin-${weekNumber}-${year}`;

    const blacklist = await blacklistManager.get(campaignName);
    const blacklistedUrls = blacklist.map(link => link.url);

    const quote = techQuoteOfTheWeek()();
    const book = bookOfTheWeek()();
    const getLinks = persistedMemoize(process.env.CACHE_DIR, 'bst_')(bestScheduledTweets);
    const links = await getLinks({
      twitterClient,
      fbApp,
      referenceMoment,
      screenNames,
      maxTweetsPerUser: 200,
      numResults: 7,
      blacklist: blacklistedUrls,
    });

    const imageUploader = uploadImagesToCloudinary(cloudinary, process.env.CLOUDINARY_FOLDER);
    const linksWithImages = await imageUploader(links);
    const linksWithCampaignUrls = addCampaignUrls(campaignName)(linksWithImages);

    const httpClient = axios.create();

    const createCampaign = createCampaignFactory(
      httpClient,
      process.env.MAILCHIMP_API_KEY,
    );

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
      testEmails: process.env.MAILCHIMP_TEST_EMAILS.split(','),
    };

    await createCampaign(quote, book, linksWithCampaignUrls, campaignSettings);

    // updates blacklist
    const newBlacklist = addLinksToBlacklist(blacklist, links, campaignName);
    await blacklistManager.save(newBlacklist);

    return callback(null, { quote, book, linksWithCampaignUrls, newBlacklist });
  } catch (err) {
    console.error(err, err.stack);
    return callback(err);
  }
};

export default createIssue;
