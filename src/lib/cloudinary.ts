import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

// Generate URL for judgment PDF (folder matches scripts/upload-to-cloudinary.js)
export function getJudgmentPdfUrl(fileName: string): string {
  const base = fileName.replace(/\.pdf$/i, '');
  const publicId = `na-jurists/judgments/${base}`;

  const url = cloudinary.url(publicId, {
    resource_type: 'raw',
    type: 'upload',
    secure: true
  });

  return url;
}

export default cloudinary;
