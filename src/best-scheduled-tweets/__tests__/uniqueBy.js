import { test, expect } from 'vitest'
import { uniqueBy } from '../uniqueBy.js'

test('it should remove duplicates from a given array', async () => {
  const data = [1, 2, 3, 4, 1, 2, 3].map(i => ({ number: i }))
  const expectedResult = [1, 2, 3, 4].map(i => ({ number: i }))
  expect(uniqueBy('number')(data)).toStrictEqual(expectedResult)
})
