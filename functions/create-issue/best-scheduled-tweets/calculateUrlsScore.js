import debug from 'debug'

const d = debug('calculateUrlScore')

export const calculateUrlScore = (urlInfo) => {
  if (typeof urlInfo.engagement !== 'undefined') {
    const rc = typeof urlInfo.engagement.reaction_count === 'undefined'
      ? 0
      : Number(urlInfo.engagement.reaction_count)
    const cc = typeof urlInfo.engagement.comment_count === 'undefined'
      ? 0
      : Number(urlInfo.engagement.comment_count)
    const sc = typeof urlInfo.engagement.share_count === 'undefined'
      ? 0
      : Number(urlInfo.engagement.share_count)
    const cpc = typeof urlInfo.engagement.comment_plugin_count === 'undefined'
      ? 0
      : Number(urlInfo.engagement.comment_plugin_count)

    const result = rc + cc + sc + cpc

    return result
  }

  return 0
}

export const calculateUrlsScore = (urlsInfo) => {
  d('Input', urlsInfo)

  const result = urlsInfo.map(urlInfo => ({ ...urlInfo, score: calculateUrlScore(urlInfo) }))

  d('Output', result)

  return result
}

export default calculateUrlsScore
