import moment from 'moment-timezone'
import { techQuoteOfTheWeek } from 'tech-quote-of-the-week'

export async function fetchQuote (event) {
  const now = moment.tz('Etc/UTC')
  const weekNumber = now.format('W')
  const quote = techQuoteOfTheWeek()(weekNumber)

  return quote
}
