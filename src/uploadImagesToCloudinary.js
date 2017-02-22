import { mapLimit } from 'async';
import { createHash } from 'crypto';

const uploadImageToCloudinary = (cloudinaryClient, folder) => (urlInfo, cb) => {
  const publicId = `${folder}/${createHash('md5').update(urlInfo.image).digest('hex')}`;

  // TODO check if the file was already uploaded with:
  // cloudinary.api.resource('sample',
  // function(result)  { console.log(result) });

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
  }, { public_id: publicId });
};

export const uploadImagesToCloudinary = (cloudinaryClient, folder) => urlsInfo =>
  new Promise((resolve, reject) => {
    const limit = 10;
    const upload = uploadImageToCloudinary(cloudinaryClient, folder);
    mapLimit(urlsInfo, limit, upload, (err, urlsInfoWithUploadLinks) => {
      if (err) {
        return reject(err);
      }

      return resolve(urlsInfoWithUploadLinks);
    });
  },
);

export default uploadImagesToCloudinary;
