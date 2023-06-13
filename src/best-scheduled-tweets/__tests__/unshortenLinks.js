import { spy } from 'sinon'
import { unshortenLinks } from '../unshortenLinks'

test('it should unshorten a set of given links', async (endTest) => {
  const requestMock = {
    get: spy((config, cb) => setImmediate(
      () => cb(null, {
        headers: {
          location: `unshortened_${config.url}`
        }
      })
    ))
  }

  const links = [1, 2, 3, 4].map(i => `link${i}`)
  const expectedResult = links.map(link => `unshortened_${link}`)

  const unshortenedLinks = await (unshortenLinks(requestMock)(links))
  expect(unshortenedLinks).toStrictEqual(expectedResult)

  endTest()
})

test('It should return the same link if there is no location header in the response', async (endTest) => {
  const requestMock = {
    get: spy((config, cb) => setImmediate(
      () => cb(null, {
        headers: {}
      })
    ))
  }

  const links = [1, 2, 3, 4].map(i => `link${i}`)

  const unshortenedLinks = await (unshortenLinks(requestMock)(links))
  expect(unshortenedLinks).toStrictEqual(links)

  endTest()
})

test('It should return undefined if one of the links fails to be unshortened', async (endTest) => {
  const requestMock = {
    get: spy((config, cb) => setImmediate(
      () => cb(new Error('some error'))
    ))
  }

  const links = [1, 2, 3, 4].map(i => `link${i}`)
  const expectedResult = links.map(() => undefined)

  const unshortenedLinks = await (unshortenLinks(requestMock)(links))
  expect(unshortenedLinks).toStrictEqual(expectedResult)

  endTest()
})
