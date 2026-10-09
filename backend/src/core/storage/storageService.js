import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import multer from 'multer';
import { config } from '../../config/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Local uploads directory
const uploadsDir = path.join(__dirname, '../../../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Subdirectories for organization
const proofDir = path.join(uploadsDir, 'proofs');
const affiliationDir = path.join(uploadsDir, 'affiliations');
const templeDir = path.join(uploadsDir, 'temples');

[proofDir, affiliationDir, templeDir].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// Configure Multer storage
const diskStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === 'proof_media') {
      cb(null, proofDir);
    } else if (file.fieldname === 'affiliation_proof') {
      cb(null, affiliationDir);
    } else {
      cb(null, templeDir);
    }
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, uniqueName);
  }
});

// File validation filter
const fileFilter = (req, file, cb) => {
  const allowedMime = [
    'image/jpeg', 'image/png', 'image/webp', 'image/jpg',
    'video/mp4', 'video/quicktime', 'video/webm',
    'application/pdf'
  ];
  if (allowedMime.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type ${file.mimetype}. Only images, videos, and PDFs are supported.`));
  }
};

export const uploadMiddleware = multer({
  storage: diskStorage,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB max for video proofs
  },
  fileFilter
});

/**
 * Get Public Accessible URL for uploaded file
 */
export function getPublicMediaUrl(file, req) {
  if (!file) return null;
  
  // If S3 configured in production, return S3 URL or presigned URL
  if (config.storage.provider === 's3' && config.storage.s3Endpoint) {
    return `${config.storage.s3Endpoint}/${config.storage.s3Bucket}/${file.filename}`;
  }

  // Local / Render / Railway static file serving
  const baseUrl = `${req.protocol}://${req.get('host')}`;
  const subfolder = file.destination.includes('proofs') ? 'proofs' : 
                    file.destination.includes('affiliations') ? 'affiliations' : 'temples';
  return `${baseUrl}/uploads/${subfolder}/${file.filename}`;
}
