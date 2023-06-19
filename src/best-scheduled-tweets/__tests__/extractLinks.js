import { test, expect } from 'vitest'
import { extractLinks } from '../extractLinks.js'

test('It should extract links from a set of tweets', async () => {
  const tweets = [
    { entities: { urls: [{ expanded_url: 'url1' }] } },
    { entities: { urls: [{ expanded_url: 'url2' }, { expanded_url: 'url3' }] } },
    { entities: { } }
  ]

  const links = extractLinks(tweets)
  expect(links).toStrictEqual(['url1', 'url2', 'url3'])
})
