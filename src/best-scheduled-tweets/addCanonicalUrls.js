import { URL } from 'url'
import normalize from 'normalize-url'
import op from 'object-path'
import debug from 'debug'

const d = debug('addCanonicalUrls')

export const addCanonicalUrls = (linksData) => {
  d('Input', linksData)

  const result = linksData.map((linkData) => {
    let url = op.coalesce(linkData, ['metadata.ogUrl', 'id'])
    if (url) {
      try {
        const parts = new URL(url)
        d(`Parsing ${url}`, parts)
      } catch (e) {
        // the canonical url is relative (or broken), we try to build an absolute one
        url = (new URL(url, linkData.id)).href
      }
      url = normalize(url)
    }

    return { ...linkData, url }
  })

  d('Output', result)

  return result
}

export default addCanonicalUrls
