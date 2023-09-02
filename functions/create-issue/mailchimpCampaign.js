import { renderTemplate } from './template.js'

export function createCampaignFactory (httpClient, apiKey) {
  const [, dc] = apiKey.split('-')
  const apiEndpoint = `https://user:${apiKey}@${dc}.api.mailchimp.com/3.0`

  return async function createCampaign (quote, book, links, campaignSettings) {
    console.log('Creating campaign', campaignSettings.campaignName, { links })

    // 1. create campaign
    const createCampaignUrl = `${apiEndpoint}/campaigns`
    const previewText = links.slice(1).map(link => link.title).join(', ')
    const campaignData = {
      type: 'regular',
      recipients: {
        list_id: campaignSettings.listId
      },
      settings: {
        subject_line: `🤓 #${campaignSettings.issueNumber}: ${links.length ? links[0].title : ''}`,
        preview_text: previewText,
        title: campaignSettings.campaignName,
        from: campaignSettings.from,
        from_name: campaignSettings.fromName,
        reply_to: campaignSettings.replyTo
      },
      social_card: {
        image_url: 'https://mcusercontent.com/b015626aa6028495fe77c75ea/images/15c0d740-d78f-1ee1-f6c5-ce45d62e4188.png',
        title: `Fullstack Bulletin #${campaignSettings.issueNumber}: The best full stack content of the week!`,
        description: previewText
      }
    }

    let campaignId = null

    const response = await httpClient.post(createCampaignUrl, campaignData)

    // 2. create content
    campaignId = response.data.id
    const html = await renderTemplate({
      issueNumber: campaignSettings.issueNumber,
      quote,
      book,
      links
    })
    const createCampaignContentUrl = `${apiEndpoint}/campaigns/${campaignId}/content`
    const contentData = {
      template: {
        id: campaignSettings.templateId
      },
      html
    }

    await httpClient.put(createCampaignContentUrl, contentData)

    // 3. schedule campaign
    const scheduleCampaignUrl = `${apiEndpoint}/campaigns/${campaignId}/actions/schedule`
    await httpClient.post(scheduleCampaignUrl, {
      schedule_time: campaignSettings.scheduleTime
    })

    // 4. send test email
    const sendTestEmailUrl = `${apiEndpoint}/campaigns/${campaignId}/actions/test`
    await httpClient.post(sendTestEmailUrl, {
      test_emails: campaignSettings.testEmails,
      send_type: 'html'
    })
  }
}

export default {
  createCampaignFactory
}
