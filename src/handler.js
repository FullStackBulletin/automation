/* eslint "no-console": "off" */

import Twitter from 'twitter';
import { Facebook } from 'fb';
import moment from 'moment';
import axios from 'axios';
import { bestScheduledTweets } from 'best-scheduled-tweets';
import { autoRetrieveAccessToken } from 'best-scheduled-tweets/src/utils/fb';
import { techQuoteOfTheWeek } from 'tech-quote-of-the-week';
import { persistedMemoize } from './persistedMemoize';
import { createCampaignFactory } from './mailchimpCampaign';

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

    const createCampaign = createCampaignFactory(
      axios,
      process.env.MAILCHIMP_API_KEY,
    );

    const campaignSettings = {
      listId: process.env.MAILCHIMP_LIST_ID,
      templateId: process.env.MAILCHIMP_TEMPLATE_ID,
      referenceTime: referenceMoment,
    };

    const response = await createCampaign(quote, links, campaignSettings);

    return callback(null, { quote, links, response });
  } catch (err) {
    console.error(err, err.stack);
    return callback(err);
  }
};

export default createIssue;
