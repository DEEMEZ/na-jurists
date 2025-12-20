import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

// Generate URL for judgment PDF
export function getJudgmentPdfUrl(fileName: string): string {
  // Remove .pdf extension if present
  const publicId = `na-juristsjudgements/${fileName.replace('.pdf', '')}`;

  const url = cloudinary.url(publicId, {
    resource_type: 'raw',
    type: 'upload',
    secure: true
  });

  return url;
}

export default cloudinary;
