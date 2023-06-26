/* eslint new-cap: "off" */
const DEFAULT_KEY = 'blacklist.json'

export const get = (s3, bucket, key = DEFAULT_KEY) => currentCampaignName =>
  new Promise((resolve, reject) => {
    const params = {
      Bucket: bucket,
      Key: key
    }

    s3.getObject(params, (err, data) => {
      if (err) {
        if (err.code === 'NoSuchKey') {
          return resolve([])
        }
        return reject(err)
      }

      let blackList = JSON.parse(data.Body.toString())
      if (currentCampaignName) {
        blackList = blackList.filter(link => link.campaignName !== currentCampaignName)
      }

      return resolve(blackList)
    })
  })

export const save = (s3, bucket, key = DEFAULT_KEY) => (blacklist) => {
  const params = {
    Bucket: bucket,
    Key: key,
    Body: JSON.stringify(blacklist, null, 2)
  }

  return s3.putObject(params).promise()
}

export const addLinksToBlacklist = (blacklist, links, campaignName) => {
  const formattedLinks = links.map(link => ({
    campaignName,
    url: link.url
  }))

  return blacklist.concat(formattedLinks)
}

export const createBlacklistManager = (s3, bucket, key = DEFAULT_KEY) => ({
  get: get(s3, bucket, key),
  save: save(s3, bucket, key)
})

export default {
  get,
  save,
  addLinksToBlacklist,
  createBlacklistManager
}
