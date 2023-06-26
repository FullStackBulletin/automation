import { test, expect } from 'vitest'
import { getLinkLabelBasedOnUrl } from '../getLinkLabelBasedOnUrl.js'

test('it should return the default label if no domain is matched', async () => {
  const url = 'https://medium.com/airbnb-engineering/introducing-lottie-4ff4a0afac0e?utm_source=fullstackbulletin.com&utm_medium=newsletter&utm_campaign=fullstackBulletin-10-2017&utm_content=description'
  expect(getLinkLabelBasedOnUrl(url)).toEqual('Read article')
})

test('it should return the github label', async () => {
  const url = 'https://github.com/ryanmcdermott/clean-code-javascript?utm_source=fullstackbulletin.com&utm_medium=newsletter&utm_campaign=fullstackBulletin-10-2017&utm_content=description'
  expect(getLinkLabelBasedOnUrl(url)).toEqual('View Repository')
})

test('it should return the youtube label', async () => {
  const url = 'https://www.youtube.com/watch?v=7ctkTFv6XdA&utm_source=fullstackbulletin.com&utm_medium=newsletter&utm_campaign=fullstackBulletin-10-2017&utm_content=description'
  expect(getLinkLabelBasedOnUrl(url)).toEqual('Watch video')
})

test('it should return the vimeo label', async () => {
  const url = 'https://vimeo.com/171068992?utm_source=fullstackbulletin.com&utm_medium=newsletter&utm_campaign=fullstackBulletin-10-2017&utm_content=description'
  expect(getLinkLabelBasedOnUrl(url)).toEqual('Watch video')
})
