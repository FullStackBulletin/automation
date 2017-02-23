import { mapLimit } from 'async';
import utmBuilder from 'utm-builder';

const addCampaignUrl = campaign => (urlInfo, cb) => {
  const source = 'fullstackbulletin.com';
  const medium = 'newsletter';
  const contents = ['title', 'image', 'description'];
  const campaignUrls = contents.reduce((map, content) => {
    map.set(content, utmBuilder(urlInfo.id, source, medium, campaign, content));
    return map;
  }, new Map());

  return cb(null, { ...urlInfo, campaignUrls });
};

export const addCampaignUrls = campaign => urlsInfo =>
  new Promise((resolve, reject) => {
    const limit = 1;
    mapLimit(urlsInfo, limit, addCampaignUrl(campaign), (err, linksWithCampaignUrls) => {
      if (err) {
        return reject(err);
      }

      return resolve(linksWithCampaignUrls);
    });
  },
);

export default { addCampaignUrls };
