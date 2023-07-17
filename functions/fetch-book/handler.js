import moment from 'moment-timezone'
import { bookOfTheWeek } from 'fullstack-book-of-the-week'

export async function fetchBook (event) {
  const now = moment.tz('Etc/UTC')
  const weekNumber = now.format('W')
  const book = bookOfTheWeek()(weekNumber)

  return book
}
