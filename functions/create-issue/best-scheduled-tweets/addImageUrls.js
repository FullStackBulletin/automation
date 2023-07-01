import { URL } from 'url'
import map from 'async/map.js'
import op from 'object-path'
import debug from 'debug'

const d = debug('addImageUrls')

function isImageUrlValid (imageUrl) {
  try {
    const { host, pathname, protocol } = new URL(imageUrl)
    return host && pathname && protocol
  } catch (e) {
    return false
  }
}

export const addImageUrls = (fallbackImageClient) => async (links) => {
  d('Input', links)

  const result = map(links, async (link) => {
    let imageUrl = op.coalesce(link.metadata, ['ogImage', 'twitterImageSrc'])
    if (!imageUrl || !isImageUrlValid(imageUrl)) {
      const fallbackImage = await fallbackImageClient.getImageUrl(link.url)
      d(`Found invalid image URL (${imageUrl}), replaced with default one (${fallbackImage})`)
      imageUrl = fallbackImage
    }
    return { ...link, image: imageUrl }
  })

  d('Output', result)

  return result
}

export default addImageUrls
