/**
 * Upload all judgment PDFs to Supabase Storage
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs').promises;
const path = require('path');

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const PDF_SOURCE_DIR = path.join(__dirname, '..', 'Reported Judgements PDF');
const BUCKET_NAME = 'reportedjudgements';

async function uploadPDF(filePath, fileName) {
  try {
    const fileBuffer = await fs.readFile(filePath);

    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(fileName, fileBuffer, {
        contentType: 'application/pdf',
        upsert: true
      });

    if (error) throw error;

    return { success: true, path: data.path };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function uploadAllPDFs() {
  try {
    console.log('🚀 Starting PDF upload to Supabase...\n');
    console.log(`📁 Source: ${PDF_SOURCE_DIR}`);
    console.log(`🗄️  Bucket: ${BUCKET_NAME}\n`);

    // Get all PDF files
    const files = await fs.readdir(PDF_SOURCE_DIR);
    const pdfFiles = files.filter(f => f.toLowerCase().endsWith('.pdf'));

    console.log(`Found ${pdfFiles.length} PDF files\n`);

    let successCount = 0;
    let failCount = 0;
    const results = [];

    // Upload each file
    for (let i = 0; i < pdfFiles.length; i++) {
      const fileName = pdfFiles[i];
      const filePath = path.join(PDF_SOURCE_DIR, fileName);

      console.log(`[${i + 1}/${pdfFiles.length}] Uploading: ${fileName}...`);

      const result = await uploadPDF(filePath, fileName);

      if (result.success) {
        console.log(`   ✅ Success`);

        // Get public URL
        const { data } = supabase.storage
          .from(BUCKET_NAME)
          .getPublicUrl(fileName);

        console.log(`   📎 URL: ${data.publicUrl}`);

        results.push({
          fileName,
          url: data.publicUrl,
          success: true
        });
        successCount++;
      } else {
        console.log(`   ❌ Failed: ${result.error}`);
        results.push({
          fileName,
          error: result.error,
          success: false
        });
        failCount++;
      }

      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    // Save results
    const outputPath = path.join(__dirname, 'supabase-upload-results.json');
    await fs.writeFile(outputPath, JSON.stringify(results, null, 2));

    console.log('\n' + '='.repeat(60));
    console.log('📊 UPLOAD SUMMARY');
    console.log('='.repeat(60));
    console.log(`✅ Successful: ${successCount}`);
    console.log(`❌ Failed: ${failCount}`);
    console.log(`📄 Results saved to: ${outputPath}`);
    console.log('='.repeat(60));

    // Show example URL
    if (results.length > 0 && results[0].success) {
      console.log('\n📋 Example URL:');
      console.log(results[0].url);
      console.log('\nAll PDFs will follow this pattern!');
    }

  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  }
}

// Run the upload
uploadAllPDFs();
