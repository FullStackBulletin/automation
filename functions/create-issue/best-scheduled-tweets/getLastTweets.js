import { mapLimit } from 'async'
import debug from 'debug'
import { flatten } from './utils/flatten.js'

const d = debug('getLastTweets')

const getLastTweetsPerUser = (client, maxTweets) => (screenName, cb) => {
  const options = {
    screen_name: screenName,
    count: maxTweets
  }

  return client.get('statuses/user_timeline', options, cb)
}

export const getLastTweets = (client, screenNames, maxTweets) => {
  d('Input', { client, screenNames, maxTweets })

  const result = new Promise((resolve, reject) => {
    const limit = 10
    const lastTweetsPerUser = getLastTweetsPerUser(client, maxTweets)
    mapLimit(screenNames, limit, lastTweetsPerUser, (err, tweets) => {
      if (err) {
        return reject(err)
      }

      const flattenedTweets = flatten(tweets)

      return resolve(flattenedTweets)
    })
  })

  d('Output', result)

  return result
}

export default getLastTweets
