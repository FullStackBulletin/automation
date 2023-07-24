import { test, expect } from 'vitest'
import { calculateUrlsScore } from '../calculateUrlsScore.js'

test('It should calculate and add the score to a set of links', async () => {
  const urls = [
    { engagement: { comment_count: 10, share_count: 17 } },
    { engagement: { comment_count: 10, comment_plugin_count: 1 } },
    { engagement: { share_count: 17, reaction_count: 2 } },
    {}
  ]

  const urlsWithScore = calculateUrlsScore(urls)
  expect(urlsWithScore[0].score).toEqual(27)
  expect(urlsWithScore[1].score).toEqual(11)
  expect(urlsWithScore[2].score).toEqual(19)
  expect(urlsWithScore[3].score).toEqual(0)
})
