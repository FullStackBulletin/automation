import { test, expect } from 'vitest'
import { flatten } from '../../utils/flatten.js'

test('It flattens an array with nested arrays', async () => {
  const arr = [[1], [2], [3]]
  expect(flatten(arr)).toStrictEqual([1, 2, 3])
})
