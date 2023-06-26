import debug from 'debug'

const d = debug('removeBlacklistedUrls')

export const removeBlacklistedUrls = (blacklist) => {
  d('Input', blacklist)

  const b = new Set(blacklist)
  const result = links => links.filter(link => !b.has(link))

  d('Output', result)

  return result
}

export default removeBlacklistedUrls
