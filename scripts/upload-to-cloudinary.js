/**
 * Upload all judgment PDFs to Cloudinary
 *
 * Usage:
 * 1. Fill in your Cloudinary credentials in .env.local
 * 2. Run: node scripts/upload-to-cloudinary.js
 */

require('dotenv').config({ path: '.env.local' });
const fs = require('fs').promises;
const path = require('path');
const https = require('https');
const { createReadStream } = require('fs');

// Cloudinary credentials from .env.local
const CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
const API_KEY = process.env.CLOUDINARY_API_KEY;
const API_SECRET = process.env.CLOUDINARY_API_SECRET;

if (!CLOUD_NAME || !API_KEY || !API_SECRET) {
  console.error('❌ Missing Cloudinary credentials in .env.local');
  console.error('Please add: CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET');
  process.exit(1);
}

const PDF_SOURCE_DIR = path.join(__dirname, '..', 'Reported Judgements PDF');
const CLOUDINARY_FOLDER = 'na-jurists/judgments';

// Upload a single file to Cloudinary
async function uploadToCloudinary(filePath, fileName) {
  return new Promise((resolve, reject) => {
    const FormData = require('form-data');
    const form = new FormData();

    // Generate signature for secure upload
    const timestamp = Math.round(Date.now() / 1000);
    const crypto = require('crypto');

    // Cloudinary requires params in alphabetical order
    const publicId = fileName.replace('.pdf', '');
    const paramsToSign = `folder=${CLOUDINARY_FOLDER}&public_id=${publicId}&timestamp=${timestamp}${API_SECRET}`;
    const signature = crypto.createHash('sha1').update(paramsToSign).digest('hex');

    form.append('file', createReadStream(filePath));
    form.append('folder', CLOUDINARY_FOLDER);
    form.append('public_id', fileName.replace('.pdf', ''));
    form.append('resource_type', 'raw');
    form.append('timestamp', timestamp);
    form.append('api_key', API_KEY);
    form.append('signature', signature);

    const options = {
      hostname: 'api.cloudinary.com',
      path: `/v1_1/${CLOUD_NAME}/raw/upload`,
      method: 'POST',
      headers: form.getHeaders()
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          if (res.statusCode === 200) {
            resolve(result);
          } else {
            reject(new Error(`Upload failed: ${data}`));
          }
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on('error', reject);
    form.pipe(req);
  });
}

// Main upload function
async function uploadAllPDFs() {
  try {
    console.log('🚀 Starting PDF upload to Cloudinary...\n');
    console.log(`📁 Source: ${PDF_SOURCE_DIR}`);
    console.log(`☁️  Cloud: ${CLOUD_NAME}`);
    console.log(`📂 Folder: ${CLOUDINARY_FOLDER}\n`);

    // Get all PDF files
    const files = await fs.readdir(PDF_SOURCE_DIR);
    const pdfFiles = files.filter(f => f.toLowerCase().endsWith('.pdf'));

    console.log(`Found ${pdfFiles.length} PDF files\n`);

    const results = [];
    let successCount = 0;
    let failCount = 0;

    // Upload each file
    for (let i = 0; i < pdfFiles.length; i++) {
      const fileName = pdfFiles[i];
      const filePath = path.join(PDF_SOURCE_DIR, fileName);

      try {
        console.log(`[${i + 1}/${pdfFiles.length}] Uploading: ${fileName}...`);

        const result = await uploadToCloudinary(filePath, fileName);

        console.log(`   ✅ Success: ${result.secure_url}`);

        results.push({
          fileName,
          url: result.secure_url,
          publicId: result.public_id,
          success: true
        });

        successCount++;
      } catch (error) {
        console.log(`   ❌ Failed: ${error.message}`);

        results.push({
          fileName,
          error: error.message,
          success: false
        });

        failCount++;
      }

      // Add small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    // Save results to file
    const outputPath = path.join(__dirname, 'cloudinary-upload-results.json');
    await fs.writeFile(outputPath, JSON.stringify(results, null, 2));

    console.log('\n' + '='.repeat(60));
    console.log('📊 UPLOAD SUMMARY');
    console.log('='.repeat(60));
    console.log(`✅ Successful: ${successCount}`);
    console.log(`❌ Failed: ${failCount}`);
    console.log(`📄 Results saved to: ${outputPath}`);
    console.log('='.repeat(60));

    // Generate URL mapping for code
    console.log('\n📋 URL MAPPING FOR CODE:\n');
    const urlMap = {};
    results.filter(r => r.success).forEach(r => {
      urlMap[r.fileName] = r.url;
    });
    console.log(JSON.stringify(urlMap, null, 2));

  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  }
}

// Install required package if missing
async function checkDependencies() {
  try {
    require('form-data');
  } catch (e) {
    console.log('📦 Installing required package: form-data');
    const { execSync } = require('child_process');
    execSync('npm install form-data', { stdio: 'inherit' });
  }
}

// Run the script
checkDependencies().then(() => {
  uploadAllPDFs();
});
