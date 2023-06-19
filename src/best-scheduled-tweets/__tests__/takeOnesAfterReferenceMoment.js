import { test, expect } from 'vitest'
import moment from 'moment'
import { takeOnesAfterReferenceMoment } from '../takeOnesAfterReferenceMoment.js'

test('it should take only the tweets after a given reference moment', async () => {
  const referenceMoment = moment('1987-05-17')
  const createFakeTweet = date => ({
    created_at: moment(date).format()
  })

  const tweets = [
    '1987-05-16',
    '1987-05-17',
    '1987-05-18',
    '1987-05-19',
    '1987-10-04'
  ].map(createFakeTweet)

  const expectedResult = [
    '1987-05-18',
    '1987-05-19',
    '1987-10-04'
  ].map(createFakeTweet)

  expect(
    takeOnesAfterReferenceMoment(referenceMoment)(tweets)
  ).toStrictEqual(
    expectedResult
  )
})
