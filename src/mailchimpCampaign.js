export const createCampaign = (httpClient, apiKey) => {
  const [, dc] = apiKey.split('-');
  const apiEndpoint = `https://user:${apiKey}@${dc}.api.mailchimp.com/3.0`;
  return (links, campaignSettings) => {
    const createCampaignUrl = `${apiEndpoint}/campaigns`;
    const campaignData = {
      type: 'regular',
      recipient: campaignSettings.listId,
      settings: {
        subject_line: 'Some subject',
        title: 'Some title',
        from_name: 'from_name',
        reply_to: 'some_reply_to',
      },
    };

    return httpClient.post(createCampaignUrl, campaignData)
    .then((response) => {
      const campaignId = response.body.id;
      const createCampaignContentUrl = `${apiEndpoint}/campaigns/${campaignId}/content`;
      const contentData = {
        // TODO add content here
      };

      return httpClient.put(createCampaignContentUrl, contentData);
    });
  };
};

export default {
  createCampaign,
};
