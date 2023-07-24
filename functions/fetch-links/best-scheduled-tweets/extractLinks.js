/* eslint no-confusing-arrow: 0 */
import debug from 'debug'

const d = debug('extractLinks')

export const extractLinks = (mastodonStatuses) => {
  d('Input', mastodonStatuses)

  const result = mastodonStatuses
    .filter(post => post.card)
    .map(post => post.card.url)

  d('Output', result)

  return result
}

export default extractLinks
