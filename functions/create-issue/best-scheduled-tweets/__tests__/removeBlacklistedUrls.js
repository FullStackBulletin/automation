import { test, expect } from 'vitest'
import { removeBlacklistedUrls } from '../removeBlacklistedUrls.js'

test('it should remove blacklisted urls from a list of urls', async () => {
  const blacklist = [2, 3, 5]
  const arr = [1, 2, 3, 4, 5, 6]
  const expectedResult = [1, 4, 6]

  expect(removeBlacklistedUrls(blacklist)(arr)).toStrictEqual(expectedResult)
})
