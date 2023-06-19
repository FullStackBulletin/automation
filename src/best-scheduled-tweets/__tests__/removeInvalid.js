import { test, expect } from 'vitest'
import { removeInvalid } from '../removeInvalid.js'

test('it should remove invalid values from an array', async () => {
  const data = [
    'https://1',
    'http://2',
    undefined,
    3,
    undefined,
    4,
    5,
    undefined,
    { id: 'http://6' }
  ]
  const expectedResult = ['https://1', 'http://2', { id: 'http://6' }]
  expect(removeInvalid(data)).toStrictEqual(expectedResult)
})
