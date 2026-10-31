import multer from 'multer';
import { ApiError } from '../utils/apiError.js';

const storage = multer.memoryStorage();

const allowed = new Set(['image/jpeg', 'image/png', 'image/webp', 'application/pdf']);

export const upload = multer({
  storage,
  limits: { fileSize: 8 * 1024 * 1024, files: 8 },
  fileFilter: (_req, file, cb) => {
    if (!allowed.has(file.mimetype)) {
      cb(new ApiError(400, 'Only JPEG, PNG, WebP and PDF files are allowed'));
      return;
    }
    cb(null, true);
  },
});
