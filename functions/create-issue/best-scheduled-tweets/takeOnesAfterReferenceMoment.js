import moment from 'moment'
import debug from 'debug'

const d = debug('takeOnesAfterReferenceMoment')

export const takeOnesAfterReferenceMoment = referenceMoment => (mastodonStatuses) => {
  d('Input', mastodonStatuses)

  const result = mastodonStatuses.filter((status) => {
    const tweetTime = moment(new Date(status.created_at))
    return tweetTime.isAfter(referenceMoment)
  })

  d('Output', result)

  return result
}

export default takeOnesAfterReferenceMoment
