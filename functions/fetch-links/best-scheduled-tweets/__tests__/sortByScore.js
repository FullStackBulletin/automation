import { test, expect } from 'vitest'
import { sortByScore } from '../sortByScore.js'

test('it should sort objects by descendent score', async () => {
  const data = [2, 1, 5, 4, 3].map(i => ({ score: i }))
  const expectedResult = [1, 2, 3, 4, 5].reverse().map(i => ({ score: i }))
  expect(sortByScore(data)).toStrictEqual(expectedResult)
})
