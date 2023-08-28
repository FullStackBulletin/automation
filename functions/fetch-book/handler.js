import { bookOfTheWeek } from 'fullstack-book-of-the-week'

export async function fetchBook (event) {
  const book = bookOfTheWeek()(event.NextIssue.number)

  return book
}
