import { test, expect } from 'vitest'
import { keepMinimalData } from '../keepMinimalData.js'

test('it should keep minimal data from an array of objects with many properties', async () => {
  const data = [{
    a: 'a',
    b: 'b',
    c: 'c',
    title: 'title',
    description: 'description',
    url: 'url',
    image: 'image',
    score: 1,
    d: 'd'
  }]

  const expectedResult = [{
    title: 'title',
    description: 'description',
    url: 'url',
    image: 'image',
    score: 1
  }]

  expect(keepMinimalData(data)).toStrictEqual(expectedResult)
})
