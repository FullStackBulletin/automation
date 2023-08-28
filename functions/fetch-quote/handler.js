import { techQuoteOfTheWeek } from 'tech-quote-of-the-week'

export async function fetchQuote (event) {
  const quote = techQuoteOfTheWeek()(event.NextIssue.number)

  return quote
}
