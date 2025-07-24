const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

// Array of Excel files to process (currently one file)
const inputFiles = [
    '../public/data/CASES List.xlsx',
];

const outputPath = path.join(__dirname, '../public/data/cases.json');
let allCases = [];

// Function to process Excel file
function processExcelFile(filePath) {
    try {
        console.log(`📖 Reading Excel file: ${path.basename(filePath)}`);

        const workbook = XLSX.readFile(filePath);
        const sheetNames = workbook.SheetNames;
        let fileCases = [];

        sheetNames.forEach(sheetName => {
            const worksheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: null }); // Preserve empty cells as `null`

            const processedData = jsonData.map((item, index) => {
                const cleanedItem = {};
                for (const key in item) {
                    if (Object.hasOwnProperty.call(item, key)) {
                        const cleanedKey = key.trim().replace(/\r?\n|\r/g, ' ');
                        const value = typeof item[key] === 'string' ? item[key].trim() : item[key];
                        cleanedItem[cleanedKey] = value;
                    }
                }
                return {
                    id: `${sheetName}-${index + 1}`,
                    category: sheetName,
                    ...cleanedItem
                };
            });

            fileCases = [...fileCases, ...processedData];
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
        console.log('🚀 Starting Excel document conversion process...');

        // Process all files sequentially
        for (const filePath of inputFiles) {
            const fullPath = path.join(__dirname, filePath);

            // Validate input file exists
            if (!fs.existsSync(fullPath)) {
                console.error(`❌ Error: File not found at: ${fullPath}`);
                continue;
            }

            const fileCases = processExcelFile(fullPath);
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