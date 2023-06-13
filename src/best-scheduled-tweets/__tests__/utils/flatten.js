import { flatten } from '../../utils/flatten'

test('It flattens an array with nested arrays', (endTest) => {
  const arr = [[1], [2], [3]]
  expect(flatten(arr)).toStrictEqual([1, 2, 3])

  endTest()
})
