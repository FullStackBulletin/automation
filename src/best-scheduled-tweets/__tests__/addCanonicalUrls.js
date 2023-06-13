import { addCanonicalUrls } from '../addCanonicalUrls'

test('It should select the first found value among metadata.ogUrl, id or undefined and normalize relative urls', (endTest) => {
  const linksData = [
    { metadata: { ogUrl: 'http://foo.bar/1' } },
    { id: 'http://foo.bar/2' },
    { foo: 'bar' },
    { id: 'http://foo.bar/2', metadata: { ogUrl: '/relative' } }
  ]

  const linksDataWithCanonicalUrl = addCanonicalUrls(linksData)
  expect(linksDataWithCanonicalUrl[0].url).toEqual('http://foo.bar/1')
  expect(linksDataWithCanonicalUrl[1].url).toEqual('http://foo.bar/2')
  expect(linksDataWithCanonicalUrl[2].url).toEqual(undefined)
  expect(linksDataWithCanonicalUrl[3].url).toEqual('http://foo.bar/relative')

  endTest()
})
