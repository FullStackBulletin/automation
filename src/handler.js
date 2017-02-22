/* eslint "no-console": "off" */

import sourceMapSupport from 'source-map-support';
import Twitter from 'twitter';
import { Facebook } from 'fb';
import moment from 'moment';
import axios from 'axios';
import cloudinary from 'cloudinary';
import { bestScheduledTweets } from 'best-scheduled-tweets';
import { autoRetrieveAccessToken } from 'best-scheduled-tweets/src/utils/fb';
import { techQuoteOfTheWeek } from 'tech-quote-of-the-week';
import { persistedMemoize } from './persistedMemoize';
import { uploadImagesToCloudinary } from './uploadImagesToCloudinary';
import { createCampaignFactory } from './mailchimpCampaign';

sourceMapSupport.install();

export const createIssue = async (event, context, callback) => {
  try {
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

    const referenceMoment = moment().subtract('1', 'week').startOf('day');
    const screenNames = process.env.TWITTER_SCREEN_NAMES.split(',');

    const quote = techQuoteOfTheWeek()();
    const getLinks = persistedMemoize(process.env.CACHE_DIR, 'bst_')(bestScheduledTweets);
    const links = await getLinks({
      twitterClient,
      fbApp,
      referenceMoment,
      screenNames,
      maxTweetsPerUser: 200,
      numResults: 7,
      blacklistedUrls: [],
    });

    const imageUploader = uploadImagesToCloudinary(cloudinary, process.env.CLOUDINARY_FOLDER);
    const linksWithImages = await imageUploader(links);

    const httpClient = axios.create();
    // httpClient.interceptors.request.use((config) => {
    //   // console.log('Request', JSON.stringify(config, null, 2));
    //   return config;
    // }, (error) => {
    //   // console.error('Request Error', error);
    //   return Promise.reject(error);
    // });
    // httpClient.interceptors.response.use((response) => {
    //   // console.log('Response', response.data.errors);
    //   // console.log(response.data.errors);
    //   return response;
    // }, (error) => {
    //   console.error('Response Error', error.response.data.errors);
    //   return Promise.reject(error);
    // });

    const createCampaign = createCampaignFactory(
      httpClient,
      process.env.MAILCHIMP_API_KEY,
    );

    const campaignSettings = {
      listId: process.env.MAILCHIMP_LIST_ID,
      templateId: parseInt(process.env.MAILCHIMP_TEMPLATE_ID, 10),
      referenceTime: referenceMoment,
    };

    await createCampaign(quote, linksWithImages, campaignSettings);

    return callback(null, { quote, linksWithImages });
  } catch (err) {
    console.error(err, err.stack);
    return callback(err);
  }
};

export default createIssue;
