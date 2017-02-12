import { mapLimit } from 'async';

const uploadImageToCloudinary = cloudinaryClient => (urlInfo, cb) => {
  cloudinaryClient.uploader.upload(urlInfo.image, (uploadedInfo) => {
    if (uploadedInfo.error) {
      return cb(uploadedInfo.error);
    }

    const transformations = {
      crop: 'fill',
      width: 500,
      height: 240,
      gravity: 'face',
      quality: 80,
      format: 'jpg',
    };
    const image = cloudinaryClient.url(uploadedInfo.public_id, transformations);

    return cb(null, { ...urlInfo, image, originalImage: urlInfo.image });
  });
};

export const uploadImagesToCloudinary = cloudinaryClient => urlsInfo =>
  new Promise((resolve, reject) => {
    const limit = 10;
    const upload = uploadImageToCloudinary(cloudinaryClient);
    mapLimit(urlsInfo, limit, upload, (err, urlsInfoWithUploadLinks) => {
      if (err) {
        return reject(err);
      }

      return resolve(urlsInfoWithUploadLinks);
    });
  },
);

export default uploadImagesToCloudinary;
