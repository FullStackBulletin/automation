import { request } from 'undici'
import { renderBookBuyLink, renderBookContent, renderBookImage, renderBookTitle, renderExtraContent, renderIntro, renderLinkContent, renderLinkPrimaryImage, renderQuote } from './template.js'
import { generateExtraContentTitle } from './extraContent.js'

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
  if (createCampaignResponse.statusCode >= 400) {
    console.error('Error creating campaign', { ...createCampaignData })
    throw new Error('Error creating campaign')
  }
  console.log('Created campaign', { ...createCampaignData })
  const campaignId = createCampaignData.id

  // 2. Set content
  console.log('Setting campaign content')
  const createCampaignContentUrl = `${apiEndpoint}/campaigns/${campaignId}/content`
  const contentData = {
    template: {
      id: campaignSettings.templateId,
      sections: {
        intro: await renderIntro(campaignSettings.issueNumber),
        // sponsor_banner: '', // Enable this in the future when sponsorship is automated
        quote: await renderQuote(quote),
        link_primary_image: await renderLinkPrimaryImage(links[0]),
        link_primary_content: await renderLinkContent(links[0]),
        link_secondary_content_1: await renderLinkContent(links[1]),
        link_secondary_content_2: await renderLinkContent(links[2]),
        link_secondary_content_3: await renderLinkContent(links[3]),
        link_secondary_content_4: await renderLinkContent(links[4]),
        link_secondary_content_5: await renderLinkContent(links[5]),
        link_secondary_content_6: await renderLinkContent(links[6]),
        book_title: await renderBookTitle(book),
        book_image: await renderBookImage(book),
        book_content: await renderBookContent(book),
        book_buy_amazoncom: await renderBookBuyLink(book.links.usa, 'Amazon.com'),
        book_buy_amazoncouk: await renderBookBuyLink(book.links.uk, 'Amazon.co.uk'),
        extracontent: await renderExtraContent(
          generateExtraContentTitle(campaignSettings.issueNumber),
          links.slice(7)
        )
      }
    }
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
  if (createCampaignContentResponse.statusCode >= 400) {
    console.error('Error creating campaign content', { ...createCampaignContentData })
    throw new Error('Error creating campaign content')
  }
  console.log('Created campaign content', { ...createCampaignContentData })

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
  if (scheduleCampaignResponse.statusCode >= 400) {
    console.error('Error scheduling campaign', scheduleCampaignResponseText)
    throw new Error('Error scheduling campaign')
  }
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
  if (sendTestEmailResponse.statusCode >= 400) {
    console.error('Error sending test email', sendTestEmailResponseText)
    throw new Error('Error sending test email')
  }
  console.log('Sent test email', sendTestEmailResponseText)

  return createCampaignData
}
