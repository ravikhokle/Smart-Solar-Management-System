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
  try {
    const result = await cloudinary.uploader.upload(dataUri, {
      folder,
      resource_type: 'auto',
    });
    return { url: result.secure_url, publicId: result.public_id };
  } catch (error) {
    if (error?.http_code === 401 || error?.http_code === 403) {
      throw new ApiError(
        502,
        'Cloudinary rejected the file upload. Verify the Cloudinary cloud name, API key, API secret, and upload permissions in server/.env.'
      );
    }
    throw error;
  }
}

export async function uploadMany(files, folder) {
  const list = files || [];
  const out = [];
  for (const file of list) {
    out.push(await uploadBuffer(file, folder));
  }
  return out;
}
