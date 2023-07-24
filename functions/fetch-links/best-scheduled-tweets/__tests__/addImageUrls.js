import { test, expect } from 'vitest'
import { addImageUrls } from '../addImageUrls.js'

test('It should get an image from the metadata if present or a default image if not', async () => {
  const mockFallbackImageClient = {
    getImageUrl: async () => 'https://placeimg.com/640/480/any'
  }

  const testLinks = [
    { metadata: { ogImage: 'http://ogImage.com/a.png' } },
    { metadata: { twitterImageSrc: 'https://twitterImageSrc.net/b.jpg' } },
    { metadata: { host: 'domain.com' } },
    { metadata: { ogImage: 'invalid' } }
  ]

  const linksWithImages = await addImageUrls(mockFallbackImageClient)(testLinks)

  expect(linksWithImages[0].image).toEqual('http://ogImage.com/a.png')
  expect(linksWithImages[1].image).toEqual('https://twitterImageSrc.net/b.jpg')
  expect(linksWithImages[2].image).toMatch(/placeimg\.com/)
  expect(linksWithImages[3].image).toMatch(/placeimg\.com/)
})
