import request from 'request'
import metaExtractor from 'meta-extractor'
import { pipePromises } from './utils/pipePromises'
import { getLastTweets } from './getLastTweets'
import { takeOnesAfterReferenceMoment } from './takeOnesAfterReferenceMoment'
import { extractLinks } from './extractLinks'
import { unique } from './unique'
import { removeBlacklistedUrls } from './removeBlacklistedUrls'
import { removeInvalid } from './removeInvalid'
import { normalizeUrls } from './normalizeUrls'
import { unshortenLinks } from './unshortenLinks'
import { getUrlsInfo } from './getUrlsInfo'
import { retrieveMetadata } from './retrieveMetadata'
import { removeLinksWithoutTitleOrDescription } from './removeLinksWithoutTitleOrDescription'
import { addCanonicalUrls } from './addCanonicalUrls'
import { uniqueBy } from './uniqueBy'
import { calculateUrlsScore } from './calculateUrlsScore'
import { sortByScore } from './sortByScore'
import { takeN } from './takeN'
import { addImageUrls } from './addImageUrls'
import { keepMinimalData } from './keepMinimalData'

export const defaultOptions = {
  twitterClient: undefined,
  fbApp: undefined,
  referenceMoment: undefined,
  screenNames: [],
  maxTweetsPerUser: 200,
  numResults: 7,
  blacklistedUrls: []
}

export const bestScheduledTweets = (options) => {
  const opt = { ...defaultOptions, ...options }
  return pipePromises(
    () => getLastTweets(opt.twitterClient, opt.screenNames, opt.maxTweetsPerUser),
    takeOnesAfterReferenceMoment(opt.referenceMoment),
    extractLinks,
    unique,
    unshortenLinks(request),
    removeInvalid,
    normalizeUrls,
    unique,
    removeBlacklistedUrls(options.blacklistedUrls),
    getUrlsInfo(opt.fbApp),
    retrieveMetadata(metaExtractor),
    removeLinksWithoutTitleOrDescription,
    removeInvalid,
    addCanonicalUrls,
    uniqueBy('url'),
    calculateUrlsScore,
    sortByScore,
    takeN(opt.numResults),
    addImageUrls,
    keepMinimalData
  )
}

export default bestScheduledTweets
