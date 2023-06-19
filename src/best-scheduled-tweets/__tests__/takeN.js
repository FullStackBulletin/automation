import { test, expect } from 'vitest'
import { takeN } from '../takeN.js'

test('it should take the first n elements from an array with more than n elements', async () => {
  const arr = [1, 2, 3, 4, 5, 6, 7, 8, 9]
  expect(takeN(4)(arr)).toStrictEqual([1, 2, 3, 4])
})

test('it should take all the elements from an array with less than n elements', async () => {
  const arr = [1, 2]
  expect(takeN(4)(arr)).toStrictEqual([1, 2])
})
