const escapeAttrNodeValue = value =>
  value.replace(/(&)|(")|(\u00A0)/g, (match, amp, quote) => {
    if (amp) return '&amp;';
    if (quote) return '&quot;';
    return '&nbsp;';
  })
;

const createImageHtml = (url, title) =>
  `<img alt="${escapeAttrNodeValue(title)}" src="${url}" width="194" style="max-width:500px;" class="mcnImage">`;

export const createCampaignFactory = (httpClient, apiKey) => {
  const [, dc] = apiKey.split('-');
  const apiEndpoint = `https://user:${apiKey}@${dc}.api.mailchimp.com/3.0`;
  return (quote, links, campaignSettings) => {
    const createCampaignUrl = `${apiEndpoint}/campaigns`;
    const campaignData = {
      type: 'regular',
      recipients: {
        list_id: campaignSettings.listId,
      },
      settings: {
        subject_line: 'Some subject', // TODO
        title: 'Some title',  // TODO
        from_name: 'from_name@fullstackbulletin.com',  // TODO
        reply_to: 'some_reply_to',  // TODO
      },
    };

    return httpClient.post(createCampaignUrl, campaignData)
    .then((response) => {
      const campaignId = response.data.id;
      const createCampaignContentUrl = `${apiEndpoint}/campaigns/${campaignId}/content`;
      const contentData = {
        template: {
          id: campaignSettings.templateId,
          sections: {
            content_preview: 'some preview', // TODO
            quote_text: quote.text,
            quote_author: quote.author,
            quote_author_description: quote.authorDescription,
            title: `Best 7 links of week #${campaignSettings.referenceTime.format('W')}, ${campaignSettings.referenceTime.format('YYYY')}`,
          },
        },
      };

      links.forEach((link, i) => {
        contentData.template.sections[`article_title_${i + 1}`] = link.title;
        contentData.template.sections[`article_description_${i + 1}`] = link.description;
        contentData.template.sections[`image_${i + 1}`] = createImageHtml(link.image, link.title);
      });

      return httpClient.put(createCampaignContentUrl, contentData);
    });
  };
};

export default {
  createCampaignFactory,
};
