import { normalizeUrls } from '../normalizeUrls'

test('it should normalize a given array of urls', (endTest) => {
  const urls = [
    'sindresorhus.com',
    'HTTP://xn--xample-hva.com:80/?b=bar&a=foo',
    '//sindresorhus.com:80/',
    'https://sindresorhus.com:80/',
    'sindresorhus.com/about.html#contact',
    'http://www.sindresorhus.com/about.html#contact',
    'http://sindresorhus.com/redirect/'
  ]

  const expectedResult = [
    'http://sindresorhus.com',
    'http://xn--xample-hva.com/?a=foo&b=bar',
    'http://sindresorhus.com',
    'https://sindresorhus.com:80',
    'http://sindresorhus.com/about.html',
    'http://sindresorhus.com/about.html',
    'http://sindresorhus.com/redirect'
  ]

  expect(normalizeUrls(urls)).toStrictEqual(expectedResult)

  endTest()
})
