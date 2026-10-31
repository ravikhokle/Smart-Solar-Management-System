import { cloudinary, isCloudinaryConfigured } from '../config/cloudinary.js';
import { ApiError } from '../utils/apiError.js';

export async function uploadBuffer(file, folder = 'heliosflow') {
  if (!file) throw new ApiError(400, 'No file provided');
  if (!isCloudinaryConfigured()) {
    throw new ApiError(
      503,
      'File storage is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET.'
    );
  }
  const dataUri = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
  const result = await cloudinary.uploader.upload(dataUri, {
    folder,
    resource_type: 'auto',
  });
  return { url: result.secure_url, publicId: result.public_id };
}

export async function uploadMany(files, folder) {
  const list = files || [];
  const out = [];
  for (const file of list) {
    out.push(await uploadBuffer(file, folder));
  }
  return out;
}
