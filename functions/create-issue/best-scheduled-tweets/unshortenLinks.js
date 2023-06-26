import { mapLimit } from 'async'
import debug from 'debug'

const d = debug('unshortenLinks')

const unshortenLink = request => (link, cb) => {
  request.get({ url: encodeURI(link), followRedirect: false }, (err, response) => {
    if (err) {
      // if cannot ping the link mark it as undefined so that it can be removed later
      return cb(null, undefined)
    }

    return cb(null, response.headers.location ? encodeURI(response.headers.location) : link)
  })
}

export const unshortenLinks = request => (links) => {
  d('Input', links)

  const result = new Promise((resolve, reject) => {
    const limit = 10
    mapLimit(
      links,
      limit,
      unshortenLink(request),
      (err, unshortenedLinks) => {
        if (err) {
          return reject(err)
        }
        return resolve(unshortenedLinks)
      }
    )
  })

  d('Output', result)

  return result
}

export default unshortenLinks
