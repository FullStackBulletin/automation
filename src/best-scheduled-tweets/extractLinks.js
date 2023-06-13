/* eslint no-confusing-arrow: 0 */
import debug from 'debug'

const d = debug('extractLinks')

export const extractLinks = (tweets) => {
  d('Input', tweets)

  const result = tweets.reduce(
    (links, tweet) => tweet.entities.urls
      ? links.concat(tweet.entities.urls.map(link => link.expanded_url))
      : links,
    []
  )

  d('Output', result)

  return result
}

export default extractLinks
