import request from 'request'
import metaExtractor from 'meta-extractor'
import { pipePromises } from './utils/pipePromises.js'
import { getLastMastodonStatuses } from './getLastMastodonStatuses.js'
import { takeOnesAfterReferenceMoment } from './takeOnesAfterReferenceMoment.js'
import { extractLinks } from './extractLinks.js'
import { unique } from './unique.js'
import { removeBlacklistedUrls } from './removeBlacklistedUrls.js'
import { removeInvalid } from './removeInvalid.js'
import { normalizeUrls } from './normalizeUrls.js'
import { unshortenLinks } from './unshortenLinks.js'
import { getUrlsInfo } from './getUrlsInfo.js'
import { retrieveMetadata } from './retrieveMetadata.js'
import { removeLinksWithoutTitleOrDescription } from './removeLinksWithoutTitleOrDescription.js'
import { addCanonicalUrls } from './addCanonicalUrls.js'
import { uniqueBy } from './uniqueBy.js'
import { calculateUrlsScore } from './calculateUrlsScore.js'
import { sortByScore } from './sortByScore.js'
import { takeN } from './takeN.js'
import { addImageUrls } from './addImageUrls.js'
import { keepMinimalData } from './keepMinimalData.js'

export const defaultOptions = {
  mastodonClient: undefined,
  fbApp: undefined,
  fallbackImageClient: undefined,
  referenceMoment: undefined,
  numResults: 7,
  blacklistedUrls: []
}

export const bestScheduledTweets = (options) => {
  const opt = { ...defaultOptions, ...options }
  return pipePromises(
    getLastMastodonStatuses(opt.mastodonClient),
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
    addImageUrls(opt.fallbackImageClient),
    keepMinimalData
  )
}

export default bestScheduledTweets
