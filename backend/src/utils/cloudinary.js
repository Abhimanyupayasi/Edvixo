// Cloudinary helper (placeholder). Provide unsigned upload preset or signed params.
// Install dependency: npm i cloudinary
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

export const getUnsignedUploadPreset = () => process.env.CLOUDINARY_UNSIGNED_PRESET;

export const getSignedUploadParams = (folder='institutions') => {
  const timestamp = Math.round(Date.now()/1000);
  const signature = cloudinary.utils.api_sign_request({ timestamp, folder }, process.env.CLOUDINARY_API_SECRET);
  return { timestamp, folder, api_key: process.env.CLOUDINARY_API_KEY, signature };
};

export default cloudinary;
