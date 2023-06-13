import { spy } from 'sinon'
import { retrieveMetadata } from '../retrieveMetadata'

test('it should retrieve metadata for a set of given links', async (endTest) => {
  const metadataMap = {
    uri1: {
      ogImage: 'image1'
    },
    uri2: {
      twitterImageSrc: 'image2',
      ogTitle: 'title2',
      ogDescription: 'description2'
    },
    uri3: {
      ogImage: 'image3',
      title: 'title3',
      twitterDescription: 'description3'
    },
    uri4: {
      ogImage: 'image4',
      ogTitle: 'title4',
      description: 'description4'
    }
  }

  const metaExtractor = spy(
    (obj, cb) => setImmediate(() => {
      cb(null, { id: obj.id, ...metadataMap[obj.uri] })
    })
  )

  const links = [
    {
      id: 'uri1',
      og_object: {
        title: 'title1',
        description: 'description1'
      }
    },
    {
      id: 'uri2'
    },
    {
      id: 'uri3'
    },
    {
      id: 'uri4'
    }
  ]

  const data = await (retrieveMetadata(metaExtractor)(links))

  expect(metaExtractor.callCount).toBe(links.length)
  expect(data).toMatchSnapshot()

  endTest()
})

test('it should return undefined if one link fails', async (endTest) => {
  // on someUri2 it will fail
  const metaExtractor = (obj, cb) => setImmediate(
    () => {
      if (obj.uri === 'someUri2') {
        return cb(new Error('some error'))
      }

      return cb(null, obj)
    }
  )

  const links = [1, 2, 3].map(i => ({ id: `someUri${i}` }))
  const result = await (retrieveMetadata(metaExtractor)(links))
  expect(result[1]).toBe(undefined)
  expect(result).toMatchSnapshot()

  endTest()
})

test('it should handle multiple failures', async (endTest) => {
  // on someUri2 it will fail
  const metaExtractor = (obj, cb) => setImmediate(
    () => {
      if (obj.uri === 'someUri2' || obj.uri === 'someUri3') {
        return cb(new Error('some error'))
      }

      return cb(null, obj)
    }
  )

  const links = [1, 2, 3].map(i => ({ id: `someUri${i}` }))
  const result = await (retrieveMetadata(metaExtractor)(links))
  expect(result[1]).toBe(undefined)
  expect(result[2]).toBe(undefined)
  expect(result).toMatchSnapshot()

  endTest()
})
