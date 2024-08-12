import { mapLimit } from 'async'
import op from 'object-path'
import debug from 'debug'

const d = debug('retrieveMetadata')

function retrieveMetadataFromLink (metaExtractor) {
  return async function (link) {
    return new Promise((resolve, reject) => {
      metaExtractor({ uri: link.id, timeout: 10000 }, (err, metadata) => {
        if (err) {
          // if it's not possible to retrieve metadata ignore the link
          return resolve(undefined)
        }

        const image = op.coalesce(metadata, ['ogImage', 'twitterImageSrc'], null)
        const title = op.get(link, 'og_object.title') || op.coalesce(metadata, ['ogTitle', 'title'])
        const description = op.get(link, 'og_object.description') ||
          op.coalesce(metadata, ['ogDescription', 'twitterDescription', 'description'])

        return resolve({
          ...link, image, title, description, metadata
        })
      })
    })
  }
}

export const retrieveMetadata = metaExtractor => (links) => {
  d('Input', links)

  const limit = 10
  const result = mapLimit(
    links,
    limit,
    retrieveMetadataFromLink(metaExtractor)
  )

  d('Output', result)

  return result
}

export default retrieveMetadata
