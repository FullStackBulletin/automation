import { spy } from 'sinon'
import { getUrlsInfo } from '../getUrlsInfo'

test('It should get urls info from Facebook', async (endTest) => {
  const fbApp = {
    api: spy((_, query, cb) => {
      // eslint-disable-next-line n/no-callback-literal
      setImmediate(() => cb({ id: query.id, info: 'some info' }))
    })
  }

  const urls = ['url1', 'url2', 'url3']

  const urlsInfo = await (getUrlsInfo(fbApp)(urls))
  urls.forEach((u, i) => {
    const callArgs = fbApp.api.getCall(i).args
    const encodedUrl = callArgs[1]
    expect(encodedUrl.id).toEqual(encodeURIComponent(u))
  })

  expect(urlsInfo).toStrictEqual(urls.map(url => ({ id: url, info: 'some info' })))

  endTest()
})

test('It should reject if one of the api calls to Facebook fails', async (endTest) => {
  const fbApp = {
    // eslint-disable-next-line n/no-callback-literal
    api: spy((_, url, cb) => setImmediate(() => cb({ error: 'some error' })))
  }

  const urls = ['url1', 'url2', 'url3']

  await expect(getUrlsInfo(fbApp)(urls)).rejects.toThrow('some error')

  endTest()
})

test('It should reject if one of the api calls to Facebook fails without a message', async (endTest) => {
  const fbApp = {
    api: spy((_, url, cb) => setImmediate(() => cb(null)))
  }

  const urls = ['url1', 'url2', 'url3']

  await expect(getUrlsInfo(fbApp)(urls)).rejects.toThrow('Unexpected error')

  endTest()
})
