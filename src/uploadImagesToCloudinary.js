import { mapLimit } from 'async';
import { createHash } from 'crypto';

const uploadImage = (client, imageUrl, publicId) =>
  new Promise((resolve, reject) => {
    client.uploader.upload(imageUrl, (result) => {
      if (result.error) {
        return reject(result.error);
      }

      return resolve(result);
    }, { public_id: publicId });
  })
;

const uploadImageToCloudinary = (client, folder) => (urlInfo, cb) => {
  const publicId = `${folder}/${createHash('md5').update(urlInfo.image).digest('hex')}`;

  uploadImage(client, urlInfo.image, publicId)
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
    const limit = 7;
    const upload = uploadImageToCloudinary(client, folder);
    mapLimit(urlsInfo, limit, upload, (err, urlsInfoWithUploadLinks) => {
      if (err) {
        return reject(err);
      }

      return resolve(urlsInfoWithUploadLinks);
    });
  },
);

export default { uploadImagesToCloudinary };
