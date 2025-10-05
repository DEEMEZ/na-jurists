const fs = require('fs').promises;
const path = require('path');
const mammoth = require('mammoth');
const pdfParse = require('pdf-parse');

// Directories
const DOCX_DIR = path.join(__dirname, '..', 'Reported Judgments for Website', 'docx');
const PDF_DIR = path.join(__dirname, '..', 'Reported Judgments for Website', 'pdfs');
const OUTPUT_FILE = path.join(__dirname, '..', 'public', 'data', 'reported-judgments.json');

// Parse filename to get judgment IDs
function parseFilename(filename) {
  const nameWithoutExt = filename.replace(/\.(docx|pdf)$/i, '');
  // Handle cases like "1.docx", "21,22,23.docx", "28 TO 39.docx", "57,58,59,60,61.pdf"

  // Handle "TO" pattern
  if (nameWithoutExt.includes(' TO ')) {
    const [start, end] = nameWithoutExt.split(' TO ').map(s => parseInt(s.trim()));
    const ids = [];
    for (let i = start; i <= end; i++) {
      ids.push(i);
    }
    return ids;
  }

  // Handle comma-separated pattern
  if (nameWithoutExt.includes(',')) {
    return nameWithoutExt.split(',').map(s => parseInt(s.trim()));
  }

  // Single number (handle trailing dots like "1.")
  const id = parseInt(nameWithoutExt.replace(/\.$/, ''));
  return isNaN(id) ? [] : [id];
}

// Extract text from DOCX
async function extractFromDocx(filePath) {
  try {
    const buffer = await fs.readFile(filePath);
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  } catch (error) {
    console.error(`Error extracting DOCX ${filePath}:`, error.message);
    return '';
  }
}

// Extract text from PDF
async function extractFromPdf(filePath) {
  try {
    const buffer = await fs.readFile(filePath);
    const data = await pdfParse(buffer);
    return data.text;
  } catch (error) {
    console.error(`Error extracting PDF ${filePath}:`, error.message);
    return '';
  }
}

// Parse judgment text to extract structured data
function parseJudgmentText(text, id) {
  const lines = text.split('\n').map(line => line.trim()).filter(line => line);

  // Extract citation (usually first line with pattern like "2012 P T D 44")
  const citationMatch = text.match(/(\d{4})\s+([A-Z\s]+)\s+(\d+)/);
  const citation = citationMatch ? citationMatch[0].trim() : `RJ-${id}`;

  // Extract court name (usually in brackets like [Islamabad High Court])
  const courtMatch = text.match(/\[(.*?Court.*?)\]/i);
  const court = courtMatch ? courtMatch[1].trim() : 'High Court';

  // Extract case title/parties (pattern: NAME versus NAME or Versus)
  const versusMatch = text.match(/([A-Z\s.,]+?)\s+(?:Versus|versus|v\.?|VS)\s+([A-Z\s.,]+?)(?:\n|Case|Custom|Writ)/i);
  let petitioner = 'Petitioner';
  let respondent = 'Respondent';
  let title = `Case #${id}`;

  if (versusMatch) {
    petitioner = versusMatch[1].trim();
    respondent = versusMatch[2].trim();
    title = `${petitioner} vs ${respondent}`;
  }

  // Extract case number (pattern: "Custom Reference No.4 of 2011" or "Writ Petition No.213/2023")
  const caseNumberMatch = text.match(/(Custom Reference|Writ Petition|Civil Appeal|Criminal Appeal|W\.P\.|C\.P\.)[\s\w.]*No\.?\s*(\d+[\w\/]*\d*)/i);
  const caseNumber = caseNumberMatch ? caseNumberMatch[0].trim() : `Case-${id}`;

  // Extract date (pattern: "12th October, 2011" or "15.01.2024")
  const dateMatch = text.match(/(\d{1,2}(?:st|nd|rd|th)?\s+\w+,?\s+\d{4}|\d{1,2}\.\d{2}\.\d{4}|Date of Hearing\s*:\s*(\d{1,2}\.\d{2}\.\d{4}))/i);
  const date = dateMatch ? (dateMatch[2] || dateMatch[1]).trim() : 'N/A';

  // Extract judges (pattern: "Before Name, C J")
  const judgeMatches = text.match(/Before\s+(.*?)(?:\n|Petitioner|versus)/i);
  let judges = ['Judge'];
  if (judgeMatches) {
    judges = judgeMatches[1].split(/\s+and\s+/).map(j => j.trim());
  }

  // Extract sections (pattern: "Ss. 168, 179 & 196" or "section 7E")
  const sectionsMatch = text.match(/(?:Ss?\.|section|Section)\s*([0-9A-Z,\s&-]+)/gi);
  const sections = sectionsMatch ?
    [...new Set(sectionsMatch.map(s => s.trim()))].slice(0, 5) :
    [];

  // Extract subject/law (first heading after sections)
  const subjectMatch = text.match(/----(.*?)----/);
  const subject = subjectMatch ? subjectMatch[1].trim() : 'General Law';

  // Extract dictum (usually bold or emphasized text explaining the principle)
  // Look for text between "----" markers or first paragraph after case details
  let dictumLaw = '';
  const dictumMatches = text.match(/----(.+?)----/s);
  if (dictumMatches) {
    dictumLaw = dictumMatches[1].trim().substring(0, 500);
  } else {
    // Try to find first substantial paragraph after case number
    const paragraphs = text.split('\n\n').filter(p => p.length > 100);
    dictumLaw = paragraphs[0] ? paragraphs[0].substring(0, 500) : 'Legal principle to be determined from full text.';
  }

  // Generate keywords from common legal terms in text
  const keywordPatterns = [
    /customs?/gi, /tax/gi, /appeal/gi, /confiscation/gi,
    /constitutional/gi, /fundamental rights/gi, /writ/gi,
    /jurisdiction/gi, /amendment/gi, /ordinance/gi
  ];

  const keywords = [];
  keywordPatterns.forEach(pattern => {
    if (pattern.test(text)) {
      keywords.push(pattern.source.replace(/\\gi|\\g|i$/g, '').replace(/\?/g, ''));
    }
  });

  return {
    id,
    citation,
    title,
    court,
    date,
    caseNumber,
    dictumLaw,
    subject,
    parties: {
      petitioner,
      respondent
    },
    judges,
    sections,
    fullText: text.trim(),
    keywords: [...new Set(keywords)]
  };
}

// Split text if it contains multiple judgments
function splitMultipleJudgments(text, expectedIds) {
  // If only one ID expected, return as-is
  if (expectedIds.length === 1) {
    return [{ id: expectedIds[0], text }];
  }

  // Try to split by common judgment separators
  const separators = [
    /Form No: HCJD-C-\d+/g,
    /\d{4}\s+[A-Z\s]+\d+\n\[.*?Court\]/g,
    /(?=JUDGMENT SHEET)/g
  ];

  let parts = [text];

  for (const separator of separators) {
    const matches = text.match(separator);
    if (matches && matches.length >= expectedIds.length) {
      parts = text.split(separator).filter(p => p.trim().length > 100);
      break;
    }
  }

  // If we couldn't split properly, try citation patterns
  if (parts.length === 1 && expectedIds.length > 1) {
    const citationPattern = /\d{4}\s+[A-Z\s]+\d+/g;
    const citations = text.match(citationPattern);
    if (citations && citations.length >= expectedIds.length) {
      // Split by citation positions
      const positions = [];
      let match;
      const regex = new RegExp(citationPattern.source, citationPattern.flags);
      while ((match = regex.exec(text)) !== null) {
        positions.push(match.index);
      }

      parts = [];
      for (let i = 0; i < positions.length; i++) {
        const start = positions[i];
        const end = i < positions.length - 1 ? positions[i + 1] : text.length;
        parts.push(text.substring(start, end));
      }
    }
  }

  // Map parts to IDs
  const result = expectedIds.map((id, index) => ({
    id,
    text: parts[index] || parts[0] // Fallback to first part if not enough splits
  }));

  return result;
}

// Main extraction function
async function extractAllJudgments() {
  console.log('🚀 Starting judgment extraction...\n');

  const judgments = [];

  // Process DOCX files
  console.log('📄 Processing DOCX files...');
  try {
    const docxFiles = await fs.readdir(DOCX_DIR);

    for (const file of docxFiles) {
      if (!file.endsWith('.docx')) continue;

      const ids = parseFilename(file);
      console.log(`  Processing: ${file} → IDs: ${ids.join(', ')}`);

      const filePath = path.join(DOCX_DIR, file);
      const text = await extractFromDocx(filePath);

      if (!text) {
        console.log(`    ⚠️  No text extracted from ${file}`);
        continue;
      }

      // Split if multiple judgments
      const parts = splitMultipleJudgments(text, ids);

      for (const part of parts) {
        const judgment = parseJudgmentText(part.text, part.id);
        judgments.push(judgment);
        console.log(`    ✓ Extracted judgment #${part.id}`);
      }
    }
  } catch (error) {
    console.error('Error processing DOCX files:', error.message);
  }

  // Process PDF files
  console.log('\n📕 Processing PDF files...');
  try {
    const pdfFiles = await fs.readdir(PDF_DIR);

    for (const file of pdfFiles) {
      if (!file.endsWith('.pdf')) continue;

      const ids = parseFilename(file);
      console.log(`  Processing: ${file} → IDs: ${ids.join(', ')}`);

      const filePath = path.join(PDF_DIR, file);
      const text = await extractFromPdf(filePath);

      if (!text) {
        console.log(`    ⚠️  No text extracted from ${file}`);
        continue;
      }

      // Split if multiple judgments
      const parts = splitMultipleJudgments(text, ids);

      for (const part of parts) {
        const judgment = parseJudgmentText(part.text, part.id);
        judgments.push(judgment);
        console.log(`    ✓ Extracted judgment #${part.id}`);
      }
    }
  } catch (error) {
    console.error('Error processing PDF files:', error.message);
  }

  // Sort by ID
  judgments.sort((a, b) => a.id - b.id);

  // Ensure output directory exists
  const outputDir = path.dirname(OUTPUT_FILE);
  await fs.mkdir(outputDir, { recursive: true });

  // Write to JSON file
  await fs.writeFile(OUTPUT_FILE, JSON.stringify(judgments, null, 2), 'utf8');

  console.log(`\n✅ Successfully extracted ${judgments.length} judgments!`);
  console.log(`📁 Output file: ${OUTPUT_FILE}`);
  console.log('\nJudgment IDs extracted:', judgments.map(j => j.id).sort((a, b) => a - b).join(', '));
}

// Run the extraction
extractAllJudgments().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
