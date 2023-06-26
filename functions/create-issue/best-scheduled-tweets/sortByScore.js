/* eslint no-confusing-arrow: 0 */
import debug from 'debug'

const d = debug('sortByScore')

export const sortByScore = (urlsInfo) => {
  d('Input', urlsInfo)

  const result = urlsInfo.sort((url1, url2) => (url1.score - url2.score < 0 ? 1 : -1))

  d('Output', result)

  return result
}

export default sortByScore
