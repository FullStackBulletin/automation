import moment from 'moment'
import debug from 'debug'

const d = debug('takeOnesAfterReferenceMoment')

export const takeOnesAfterReferenceMoment = referenceMoment => (tweets) => {
  d('Input', tweets)

  const result = tweets.filter((tweet) => {
    const tweetTime = moment(new Date(tweet.created_at))
    return tweetTime.isAfter(referenceMoment)
  })

  d('Output', result)

  return result
}

export default takeOnesAfterReferenceMoment
