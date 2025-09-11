const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const mammoth = require('mammoth');

// Input directory containing all reported judgment files
const inputDir = path.join(__dirname, '../Reported Judgments for Website');
const outputPath = path.join(__dirname, '../public/data/reported-judgments.json');

let allJudgments = [];

// Function to extract text content from Word documents
async function processWordFile(filePath) {
    try {
        console.log(`📖 Reading Word file: ${path.basename(filePath)}`);
        
        const result = await mammoth.extractRawText({ path: filePath });
        const html = await mammoth.convertToHtml({ path: filePath });
        
        // Extract text content
        const text = result.value.trim();
        const fileName = path.basename(filePath, path.extname(filePath));
        
        // Try to extract structured information from the text
        const judgment = extractJudgmentInfo(text, fileName);
        
        console.log(`✔️ Processed: ${fileName}`);
        return judgment;
    } catch (error) {
        console.error(`❌ Error processing ${path.basename(filePath)}:`, error.message);
        return null;
    }
}

// Function to extract judgment information from text
function extractJudgmentInfo(text, fileName) {
    // Initialize judgment object
    const judgment = {
        id: uuidv4(),
        fileName: fileName,
        title: '',
        caseNumber: '',
        court: '',
        judge: '',
        date: '',
        parties: '',
        subject: '',
        summary: '',
        fullText: text,
        type: 'Reported Judgment'
    };

    // Extract case number (various patterns)
    const caseNumberPatterns = [
        /(?:Case\s+No\.?|Civil\s+Appeal\s+No\.?|Criminal\s+Appeal\s+No\.?|Writ\s+Petition\s+No\.?|Constitution\s+Petition\s+No\.?)[\s:]*([A-Z\d\/-]+)/i,
        /([A-Z]{1,4}\.?\s*\d+[\/-]\d{4})/,
        /(\d{4}\s+[A-Z]{2,5}\s+\d+)/,
    ];
    
    for (const pattern of caseNumberPatterns) {
        const match = text.match(pattern);
        if (match) {
            judgment.caseNumber = match[1].trim();
            break;
        }
    }

    // Extract court name
    const courtPatterns = [
        /(?:Supreme Court of Pakistan|Supreme Court)/i,
        /(?:Lahore High Court|High Court of Punjab)/i,
        /(?:Islamabad High Court)/i,
        /(?:Sindh High Court)/i,
        /(?:Peshawar High Court)/i,
        /(?:Balochistan High Court)/i,
        /(?:Federal Shariat Court)/i,
        /(?:Anti[\-\s]Terrorism Court)/i,
        /(?:District Court|Session[s]? Court)/i,
        /(?:Civil Court|Criminal Court)/i
    ];
    
    for (const pattern of courtPatterns) {
        const match = text.match(pattern);
        if (match) {
            judgment.court = match[0].trim();
            break;
        }
    }

    // Extract judge name
    const judgePatterns = [
        /(?:Hon'ble\s+)?(?:Mr\.?\s+)?Justice\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/i,
        /(?:Hon'ble\s+)?Judge\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/i,
    ];
    
    for (const pattern of judgePatterns) {
        const match = text.match(pattern);
        if (match) {
            judgment.judge = `Justice ${match[1].trim()}`;
            break;
        }
    }

    // Extract date
    const datePatterns = [
        /(\d{1,2}[-\/]\d{1,2}[-\/]\d{4})/,
        /(\d{1,2}(?:st|nd|rd|th)?\s+[A-Za-z]+,?\s+\d{4})/,
        /([A-Za-z]+\s+\d{1,2},?\s+\d{4})/
    ];
    
    for (const pattern of datePatterns) {
        const match = text.match(pattern);
        if (match) {
            judgment.date = match[1].trim();
            break;
        }
    }

    // Extract parties (plaintiff vs defendant)
    const partyPatterns = [
        /([A-Z][a-zA-Z\s\.]+)\s+(?:vs?\.?|versus)\s+([A-Z][a-zA-Z\s\.]+)/,
        /Petitioner[s]?:\s*([A-Z][a-zA-Z\s\.]+)/i,
        /Appellant[s]?:\s*([A-Z][a-zA-Z\s\.]+)/i
    ];
    
    for (const pattern of partyPatterns) {
        const match = text.match(pattern);
        if (match) {
            if (match.length === 3) {
                judgment.parties = `${match[1].trim()} vs ${match[2].trim()}`;
            } else {
                judgment.parties = match[1].trim();
            }
            break;
        }
    }

    // Extract subject/legal area
    const subjectKeywords = [
        'Constitutional Law', 'Criminal Law', 'Civil Law', 'Family Law', 'Property Law',
        'Service Law', 'Tax Law', 'Banking Law', 'Company Law', 'Labour Law',
        'Administrative Law', 'Contract Law', 'Tort Law', 'Evidence Law',
        'Bail', 'Appeal', 'Revision', 'Writ', 'Contempt', 'Habeas Corpus'
    ];
    
    for (const keyword of subjectKeywords) {
        if (text.toLowerCase().includes(keyword.toLowerCase())) {
            judgment.subject = keyword;
            break;
        }
    }

    // Generate title from available information
    if (judgment.parties) {
        judgment.title = judgment.parties;
    } else if (judgment.caseNumber) {
        judgment.title = `Case No. ${judgment.caseNumber}`;
    } else {
        judgment.title = fileName.replace(/[\d,\s-]+/, '').trim() || `Judgment ${fileName}`;
    }

    // Create summary from first few sentences
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 50);
    if (sentences.length > 0) {
        judgment.summary = sentences.slice(0, 3).join('. ').trim() + (sentences.length > 3 ? '...' : '');
        if (judgment.summary.length > 300) {
            judgment.summary = judgment.summary.substring(0, 300) + '...';
        }
    }

    // Set default values if not found
    if (!judgment.court) judgment.court = 'Not specified';
    if (!judgment.subject) judgment.subject = 'General';
    if (!judgment.date) judgment.date = 'Date not available';
    if (!judgment.summary) judgment.summary = 'Summary not available';

    return judgment;
}

// Function to process PDF files (basic text extraction would require pdf-parse)
function processPdfFile(filePath) {
    console.log(`📄 Skipping PDF file (requires pdf-parse): ${path.basename(filePath)}`);
    const fileName = path.basename(filePath, path.extname(filePath));
    
    // Create basic entry for PDF files
    return {
        id: uuidv4(),
        fileName: fileName,
        title: fileName.replace(/[\d,\s-]+/, '').trim() || `Judgment ${fileName}`,
        caseNumber: 'Not extracted',
        court: 'Not specified',
        judge: 'Not specified',
        date: 'Date not available',
        parties: 'Not extracted',
        subject: 'General',
        summary: 'PDF content processing not implemented. Please view the original file.',
        fullText: 'PDF content not extracted',
        type: 'Reported Judgment (PDF)',
        isPdf: true
    };
}

async function main() {
    try {
        console.log('🚀 Starting Reported Judgments processing...');
        console.log(`📁 Input directory: ${inputDir}`);
        
        // Check if input directory exists
        if (!fs.existsSync(inputDir)) {
            throw new Error(`Input directory not found: ${inputDir}`);
        }
        
        // Get all files from the directory
        const files = fs.readdirSync(inputDir);
        console.log(`📊 Found ${files.length} files to process`);
        
        // Process each file
        for (const file of files) {
            const filePath = path.join(inputDir, file);
            const ext = path.extname(file).toLowerCase();
            
            let judgment = null;
            
            if (ext === '.docx') {
                judgment = await processWordFile(filePath);
            } else if (ext === '.pdf') {
                judgment = processPdfFile(filePath);
            } else {
                console.log(`⚠️  Skipping unsupported file type: ${file}`);
                continue;
            }
            
            if (judgment) {
                allJudgments.push(judgment);
            }
        }
        
        // Validate we have data
        if (allJudgments.length === 0) {
            throw new Error('No judgments were processed - check your input files');
        }
        
        // Ensure output directory exists
        const outputDir = path.dirname(outputPath);
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }
        
        // Write output
        fs.writeFileSync(outputPath, JSON.stringify(allJudgments, null, 2));
        
        console.log(`\n🎉 Success! Processed ${allJudgments.length} reported judgments from ${files.length} files.`);
        console.log(`📁 Output written to: ${outputPath}`);
        
        // Log summary statistics
        const docxCount = allJudgments.filter(j => !j.isPdf).length;
        const pdfCount = allJudgments.filter(j => j.isPdf).length;
        const courts = [...new Set(allJudgments.map(j => j.court))];
        const subjects = [...new Set(allJudgments.map(j => j.subject))];
        
        console.log(`\n📈 Summary:`);
        console.log(`   - DOCX files processed: ${docxCount}`);
        console.log(`   - PDF files found: ${pdfCount}`);
        console.log(`   - Courts identified: ${courts.length}`);
        console.log(`   - Subject areas: ${subjects.length}`);
        
    } catch (error) {
        console.error('\n❌ Processing failed:', error.message);
        process.exit(1);
    }
}

// Run the main function
main();