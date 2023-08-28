import moment from 'moment-timezone'
import axios from 'axios'
import { createCampaignFactory } from './mailchimpCampaign.js'

export const createIssue = async (event, context) => {
  const now = moment.tz('Etc/UTC')
  const scheduleFor = now
    .clone()
    .add(1, 'week')
    .day(1) // be sure to set it to next monday
    .hours(17)
    .minutes(0)
    .seconds(0)
    .milliseconds(0)
  const referenceMoment = now
    .clone()
    .subtract('1', 'week')
    .startOf('day')

  const weekNumber = now.format('W')
  const year = now.format('YYYY')
  const issueNumber = event.NextIssue.number
  const campaignName = `fullstackBulletin-${issueNumber}`

  console.log('Creating campaign', campaignName)

  const quote = event.data.Quote
  console.log('Loaded quote of the week', quote)

  const book = event.data.Book
  console.log('Loaded book of the week', book)

  const links = event.data.Links
  console.log('Retrieved issue links', links)

  const httpClient = axios.create()

  const createCampaign = createCampaignFactory(httpClient, process.env.MAILCHIMP_API_KEY)

  const campaignSettings = {
    listId: process.env.MAILCHIMP_LIST_ID,
    templateId: parseInt(process.env.MAILCHIMP_TEMPLATE_ID, 10),
    referenceTime: referenceMoment,
    from: process.env.MAILCHIMP_FROM_EMAIL,
    fromName: process.env.MAILCHIMP_FROM_NAME,
    replyTo: process.env.MAILCHIMP_REPLY_TO_EMAIL,
    campaignName,
    weekNumber, // TODO: update the template in mailchimp
    year,
    issueNumber,
    scheduleTime: scheduleFor.format(),
    testEmails: process.env.MAILCHIMP_TEST_EMAILS.split(',')
  }
  console.log('Creating mailchimp campaing', campaignSettings)

  if (event.config.dryRun) {
    console.log('Dry run, exiting now. No campaign created.')
    return { quote, book, links, campaignSettings, dryRun: true }
  }

  await createCampaign(quote, book, links, campaignSettings)
  console.log('Mailchimp campaign created')

  return { quote, book, links, campaignSettings }
}
