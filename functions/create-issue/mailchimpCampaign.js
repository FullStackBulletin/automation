import { request } from 'undici'
import { renderTemplate } from './template.js'

export async function createCampaign (apiKey, quote, book, links, campaignSettings) {
  const [, dc] = apiKey.split('-')
  const apiEndpoint = `https://${dc}.api.mailchimp.com/3.0`
  const authorization = `Basic ${Buffer.from(`apikey:${apiKey}`).toString('base64')}`

  console.log('Creating campaign', campaignSettings.campaignName)

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
  const createCampaignResponse = await request(
    createCampaignUrl,
    {
      method: 'POST',
      body: JSON.stringify(campaignData),
      headers: {
        'Content-Type': 'application/json',
        Authorization: authorization
      }
    }
  )
  console.log('Create campaign request sent.', {
    statusCode: createCampaignResponse.statusCode,
    headers: createCampaignResponse.headers
  })
  const createCampaignData = await createCampaignResponse.body.json()
  console.log('Created campaign', { ...createCampaignData })
  const campaignId = createCampaignData.id

  // 2a. create content
  console.log('Setting campaign content')
  const html = await renderTemplate({
    issueNumber: campaignSettings.issueNumber,
    quote,
    book,
    links
  })
  const createCampaignContentUrl = `${apiEndpoint}/campaigns/${campaignId}/content`
  const contentData = {
    html
  }

  const createCampaignContentResponse = await request(createCampaignContentUrl, {
    method: 'PUT',
    body: JSON.stringify(contentData),
    headers: {
      'Content-Type': 'application/json',
      Authorization: authorization
    }
  })
  console.log('Create campaign content request sent.', {
    statusCode: createCampaignContentResponse.statusCode,
    headers: createCampaignContentResponse.headers
  })
  const createCampaignContentData = await createCampaignContentResponse.body.json()
  console.log('Created campaign content', { ...createCampaignContentData })

  // 2b. Apply template (to allow editability)
  const setContentTemplateData = {
    template: {
      id: campaignSettings.templateId
    },
    html
  }
  const setTemplateResponse = await request(createCampaignContentUrl, {
    method: 'PUT',
    body: JSON.stringify(setContentTemplateData),
    headers: {
      'Content-Type': 'application/json',
      Authorization: authorization
    }
  })
  console.log('Upated content and forced template.', {
    statusCode: setTemplateResponse.statusCode,
    headers: setTemplateResponse.headers
  })
  const setContentTemplateResponseData = await setTemplateResponse.body.json()
  console.log('Created campaign content', { ...setContentTemplateResponseData })

  // 3. schedule campaign
  const scheduleCampaignUrl = `${apiEndpoint}/campaigns/${campaignId}/actions/schedule`
  const scheduleCampaignResponse = await request(scheduleCampaignUrl, {
    method: 'POST',
    body: JSON.stringify({
      schedule_time: campaignSettings.scheduleTime
    }),
    headers: {
      'Content-Type': 'application/json',
      Authorization: authorization
    }
  })
  console.log('Schedule campaign request sent.', {
    statusCode: scheduleCampaignResponse.statusCode,
    headers: scheduleCampaignResponse.headers
  })
  const scheduleCampaignResponseText = await scheduleCampaignResponse.body.text()
  console.log('Scheduled campaign', scheduleCampaignResponseText)

  // 4. send test email
  const sendTestEmailUrl = `${apiEndpoint}/campaigns/${campaignId}/actions/test`
  const sendTestEmailResponse = await request(sendTestEmailUrl, {
    method: 'POST',
    body: JSON.stringify({
      test_emails: campaignSettings.testEmails,
      send_type: 'html'
    }),
    headers: {
      'Content-Type': 'application/json',
      Authorization: authorization
    }
  })
  console.log('Send test email request sent.', {
    statusCode: sendTestEmailResponse.statusCode,
    headers: sendTestEmailResponse.headers
  })
  const sendTestEmailResponseText = await sendTestEmailResponse.body.text()
  console.log('Sent test email', sendTestEmailResponseText)

  return createCampaignData
}
