import { coalesce } from 'object-path'
import { URL } from 'url'
import debug from 'debug'

const d = debug('addImageUrls')

export const addImageUrls = (links) => {
  d('Input', links)

  const result = links.map((link) => {
    const defaultImage = `https://placeimg.com/500/240/tech?rnd=${Math.round(Math.random() * 999999)}`
    let image = coalesce(link.metadata, ['ogImage', 'twitterImageSrc'], defaultImage)
    if (image && image !== defaultImage) {
      // validates the url
      let error = null
      let host, pathname, protocol
      try {
        const u = new URL(image)
        host = u.host
        pathname = u.pathname
        protocol = u.protocol
      } catch (e) {
        error = e
      }
      if (!host || !pathname || error) {
        image = defaultImage
        d(`Found invalid image (${image}), replaced with default one (${defaultImage})`, { host, pathname, protocol })
      }
    }

    return { ...link, image }
  })

  d('Output', result)

  return result
}

export default addImageUrls
