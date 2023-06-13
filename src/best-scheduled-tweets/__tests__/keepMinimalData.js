import { keepMinimalData } from '../keepMinimalData'

test('it should keep minimal data from an array of objects with many properties', (endTest) => {
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

  endTest()
})
