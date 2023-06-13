import { test, expect } from 'vitest'
import { spy } from 'sinon'
import { getLastTweets } from '../getLastTweets.js'

test('it should use the twitter client to retrieve last tweets for every user', async () => {
  const twitterClient = {
    get: spy(
      (api, options, cb) => {
        setImmediate(() => cb(null, [`Tweets for ${options.screen_name}`]))
      }
    )
  }

  const screenNames = ['andreaman87', 'loige']
  const maxTweets = 20
  const api = 'statuses/user_timeline'

  const tweets = await getLastTweets(twitterClient, screenNames, maxTweets)
  expect(twitterClient.get.callCount).toEqual(screenNames.length)
  screenNames.forEach((name, i) => {
    const [currentApi, currentOptions] = twitterClient.get.getCall(i).args
    expect(currentApi).toEqual(api)
    expect(currentOptions).toStrictEqual({ screen_name: name, count: maxTweets })
  })
  expect(tweets).toStrictEqual(screenNames.map(name => `Tweets for ${name}`))
})

test('It should reject if one of the api calls to twitter fails', async () => {
  const twitterClient = {
    get: spy(
      (api, options, cb) => setImmediate(() => cb(new Error(`Error for ${options.screen_name}`)))
    )
  }

  const screenNames = ['andreaman87', 'loige']
  const maxTweets = 20

  await expect(getLastTweets(twitterClient, screenNames, maxTweets)).rejects.toThrow('Error for andreaman87')
})
