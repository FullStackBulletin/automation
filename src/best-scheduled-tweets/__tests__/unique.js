import { unique } from '../unique'

test('it should remove duplicates from a given array', (endTest) => {
  const data = [1, 2, 3, 4, 1, 2, 3]
  const expectedResult = [1, 2, 3, 4]
  expect(unique(data)).toStrictEqual(expectedResult)

  endTest()
})
