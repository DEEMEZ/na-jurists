const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const mammoth = require('mammoth');

// Array of Word files to process
const inputFiles = [
    '../public/data/Cases List Supreme Court.docx',
    '../public/data/Civil Courts cases list.docx',
    '../public/data/IHC Cases New List.docx'
];

const outputPath = path.join(__dirname, '../public/data/cases.json');
let allCases = [];

// Function to extract tables from HTML
function extractTablesFromHtml(html) {
    const cheerio = require('cheerio');
    const $ = cheerio.load(html);
    const tables = [];
    
    $('table').each((i, table) => {
        const tableData = [];
        $(table).find('tr').each((j, row) => {
            const rowData = {};
            $(row).find('th, td').each((k, cell) => {
                const header = $(cell).closest('table').find('tr').eq(0).find('th, td').eq(k).text().trim();
                const value = $(cell).text().trim();
                if (header) {
                    rowData[header] = value;
                }
            });
            if (Object.keys(rowData).length > 0) {
                tableData.push(rowData);
            }
        });
        if (tableData.length > 0) {
            tables.push(tableData);
        }
    });
    
    return tables;
}

async function processWordFile(filePath) {
    try {
        console.log(`📖 Reading Word file: ${path.basename(filePath)}`);
        
        const result = await mammoth.extractRawText({ path: filePath });
        const html = await mammoth.convertToHtml({ path: filePath });
        
        // Extract tables from the document
        const tables = extractTablesFromHtml(html.value);
        
        const fileName = path.basename(filePath);
        let fileCases = [];
        
        tables.forEach((table, tableIndex) => {
            table.forEach((row, rowIndex) => {
                const cleanedItem = {};
                
                // Clean and normalize all keys and values
                for (const key in row) {
                    if (Object.hasOwnProperty.call(row, key)) {
                        // Normalize key names
                        const cleanedKey = key
                            .trim()
                            .replace(/\r?\n|\r/g, ' ')
                            .replace(/\s+/g, ' ')
                            .replace(/\.+$/, '');
                        
                        // Clean values
                        let value = row[key];
                        if (typeof value === 'string') {
                            value = value.trim();
                            if (value === '') value = null;
                        }
                        
                        cleanedItem[cleanedKey] = value;
                    }
                }
                
                if (Object.keys(cleanedItem).length > 0) {
                    fileCases.push({
                        id: uuidv4(),
                        sourceFile: fileName,
                        tableIndex,
                        rowIndex,
                        ...cleanedItem
                    });
                }
            });
        });
        
        console.log(`✔️ Extracted ${fileCases.length} cases from ${path.basename(filePath)}`);
        return fileCases;
    } catch (error) {
        console.error(`❌ Error processing ${path.basename(filePath)}:`, error.message);
        return [];
    }
}

async function main() {
    try {
        console.log('🚀 Starting Word document conversion process...');
        
        // Process all files sequentially
        for (const filePath of inputFiles) {
            const fullPath = path.join(__dirname, filePath);
            
            // Validate input file exists
            if (!fs.existsSync(fullPath)) {
                console.error(`❌ Error: File not found at: ${fullPath}`);
                continue;
            }
            
            const fileCases = await processWordFile(fullPath);
            allCases = [...allCases, ...fileCases];
        }
        
        // Validate we have data
        if (allCases.length === 0) {
            throw new Error('No cases were processed - check your input files');
        }
        
        // Write output
        fs.writeFileSync(outputPath, JSON.stringify(allCases, null, 2));
        console.log(`\n🎉 Success! Processed ${allCases.length} total cases from ${inputFiles.length} files.`);
        console.log(`📁 Output written to: ${outputPath}`);
    } catch (error) {
        console.error('\n❌ Conversion failed:', error.message);
        process.exit(1);
    }
}

// Run the main function
main();