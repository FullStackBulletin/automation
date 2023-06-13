import mapLimit from 'async/mapLimit'
import debug from 'debug'

const d = debug('getUrlsInfo')

const getUrlInfo = fbApp => (url, cb) => {
  // facebook client doesn't follow callback errors
  // conventions
  d('Calling FB open graph apis with', { id: encodeURI(url), fields: ['engagement'] })
  fbApp.api('', { id: encodeURI(url), fields: ['engagement'] }, (res) => {
    d('FB Open Graph response', res)
    if (!res || res.error) {
      return cb(new Error(res ? JSON.stringify(res.error) : 'Unexpected error'))
    }
    return cb(null, res)
  })
}

export const getUrlsInfo = fbApp => (urls) => {
  d('Input', urls)

  const result = new Promise((resolve, reject) => {
    const getInfo = getUrlInfo(fbApp)
    const limit = 10
    mapLimit(urls, limit, getInfo, (err, urlsInfo) => {
      if (err) {
        d('Error', err)
        return reject(err)
      }

      d('Output', urlsInfo)
      return resolve(urlsInfo)
    })
  })

  return result
}

export default getUrlsInfo
