import { mapLimit } from 'async';
import { createHash } from 'crypto';

const NOTFOUND = {};

const retrieveImage = (client, publicId) =>
  new Promise((resolve, reject) => {
    client.api.resource(publicId, (result) => {
      if (result.error) {
        if (result.error.http_code === 404) {
          return resolve(NOTFOUND);
        }

        return reject(result.error);
      }

      return resolve(result);
    });
  })
;

const uploadImage = (client, imageUrl, publicId) =>
  new Promise((resolve, reject) => {
    client.uploader.upload(imageUrl, (uploadedInfo) => {
      if (uploadedInfo.error) {
        return reject(uploadedInfo.error);
      }

      return resolve(uploadedInfo);
    }, { public_id: publicId });
  })
;

const retrieveOrUploadImage = (client, imageUrl, publicId) =>
  new Promise((resolve, reject) => {
    retrieveImage(client, publicId)
    .then((image) => {
      if (image === NOTFOUND) {
        return resolve(uploadImage(client, imageUrl, publicId));
      }

      return resolve(image);
    })
    .catch(err => reject(err));
  })
;

const uploadImageToCloudinary = (client, folder) => (urlInfo, cb) => {
  const publicId = `${folder}/${createHash('md5').update(urlInfo.image).digest('hex')}.jpg`;

  retrieveOrUploadImage(client, urlInfo.image, publicId)
  .then((info) => {
    const transformations = {
      crop: 'fill',
      width: 500,
      height: 240,
      gravity: 'face',
      quality: 80,
      format: 'jpg',
    };
    const image = client.url(info.public_id, transformations);

    return cb(null, { ...urlInfo, image, originalImage: urlInfo.image });
  })
  .catch(err => cb(err));
};

export const uploadImagesToCloudinary = (client, folder) => urlsInfo =>
  new Promise((resolve, reject) => {
    const limit = 1;
    const upload = uploadImageToCloudinary(client, folder);
    mapLimit(urlsInfo, limit, upload, (err, urlsInfoWithUploadLinks) => {
      if (err) {
        return reject(err);
      }

      return resolve(urlsInfoWithUploadLinks);
    });
  },
);

export default uploadImagesToCloudinary;
