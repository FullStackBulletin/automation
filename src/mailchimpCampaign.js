const escapeAttrNodeValue = value =>
  value.replace(/(&)|(")|(\u00A0)/g, (match, amp, quote) => {
    if (amp) return '&amp;';
    if (quote) return '&quot;';
    return '&nbsp;';
  })
;

const a = (url, content) =>
  `<a href="${escapeAttrNodeValue(url)}" target="_blank">${content}</a>`;

const img = (url, title) =>
  `<img alt="${escapeAttrNodeValue(title)}" src="${url}" width="194" style="max-width:500px;" class="mcnImage">`;

const desc = (url, description) =>
  `${description}<br/>${a(url, 'Read all...')}`;

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
        subject_line: `🤓 fullstackBulletin issue ${campaignSettings.weekNumber}: ${links[0].title}`,
        title: campaignSettings.campaignName,
        from: campaignSettings.from,
        from_name: campaignSettings.fromName,
        reply_to: campaignSettings.replyTo,
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
            content_preview: links[0].title,
            quote_text: quote.text,
            quote_author: quote.author,
            quote_author_description: quote.authorDescription,
            title: `Best 7 links of week #${campaignSettings.weekNumber}, ${campaignSettings.year}`,
          },
        },
      };

      links.forEach((link, i) => {
        contentData.template.sections[`article_title_${i + 1}`] =
          a(link.campaignUrls.title, link.title);

        contentData.template.sections[`article_description_${i + 1}`] =
          desc(link.campaignUrls.description, link.description);

        contentData.template.sections[`image_${i + 1}`] =
          a(link.campaignUrls.image, img(link.image, link.title));
      });

      return httpClient.put(createCampaignContentUrl, contentData);
    });
  };
};

export default {
  createCampaignFactory,
};
