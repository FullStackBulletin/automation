import { mapLimit } from 'async'
import { createHash } from 'crypto'
import { URL } from 'url'

const uploadImage = (client, imageUrl, publicId, hostname, stopRetry) =>
  new Promise((resolve, reject) => {
    const upload = client.uploader.upload(imageUrl, (result) => {
      if (result.error) {
        if (stopRetry) {
          console.error(`Failed to upload image "${imageUrl}" to cloudinary`, result)
          return reject(result.error)
        }

        const fallbackImageUrl = 'https://placeimg.com/500/240/tech'
        return resolve(uploadImage(client, fallbackImageUrl, publicId, hostname, true))
      }
      return resolve(result)
    }, { public_id: publicId, overwrite: false })
    // ignore errors (managed internally)
    upload.catch(() => { })
  })

const uploadImageToCloudinary = (client, folder) => (urlInfo, cb) => {
  const publicId = `${folder}/${createHash('md5').update(urlInfo.image).digest('hex')}`
  const { hostname } = new URL(urlInfo.url)
  uploadImage(client, urlInfo.image, publicId, hostname)
    .then((info) => {
      const transformations = {
        crop: 'fit',
        width: 564,
        height: 317,
        gravity: 'center',
        quality: 80,
        format: 'jpg'
      }
      const image = client.url(info.public_id, transformations)

      return cb(null, { ...urlInfo, image, originalImage: urlInfo.image })
    })
    .catch(err => cb(err))
}

export const uploadImagesToCloudinary = (client, folder) => urlsInfo =>
  new Promise((resolve, reject) => {
    const limit = 7
    const upload = uploadImageToCloudinary(client, folder)
    mapLimit(urlsInfo, limit, upload, (err, urlsInfoWithUploadLinks) => {
      if (err) {
        return reject(err)
      }

      return resolve(urlsInfoWithUploadLinks)
    })
  }
  )

export default { uploadImagesToCloudinary }
