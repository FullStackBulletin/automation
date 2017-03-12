import utmBuilder from 'utm-builder';

const addCampaignUrl = campaign => (urlInfo) => {
  const source = 'fullstackbulletin.com';
  const medium = 'newsletter';
  const contents = ['title', 'image', 'description'];
  const campaignUrls = contents.reduce((acc, content) => {
    const map = acc;
    map[content] = utmBuilder(urlInfo.url, source, medium, campaign, content);
    return map;
  }, {});

  return { ...urlInfo, campaignUrls };
};

export const addCampaignUrls = campaign => urlsInfo => urlsInfo.map(addCampaignUrl(campaign));

export default { addCampaignUrls };
