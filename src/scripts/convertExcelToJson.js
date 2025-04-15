const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const inputPath = path.join(__dirname, '../public/data/CASES List.xlsx');
const outputPath = path.join(__dirname, '../public/data/cases.json');

// Validate input file
if (!fs.existsSync(inputPath)) {
  console.error('❌ Error: Excel file not found at:', inputPath);
  process.exit(1);
}

try {
  console.log('📖 Reading Excel file...');
  const workbook = XLSX.readFile(inputPath);
  const sheetNames = workbook.SheetNames;
  let allCases = [];

  console.log(`🔍 Found ${sheetNames.length} sheets: ${sheetNames.join(', ')}`);

  sheetNames.forEach(sheetName => {
    console.log(`📋 Processing sheet: ${sheetName}`);
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: null });

    const processedData = jsonData.map((item, index) => {
      const cleanedItem = {};
      
      // Clean and normalize all keys and values
      for (const key in item) {
        if (Object.hasOwnProperty.call(item, key)) {
          // Normalize key names
          const cleanedKey = key
            .trim()
            .replace(/\r?\n|\r/g, ' ') // Remove newlines
            .replace(/\s+/g, ' ') // Collapse multiple spaces
            .replace(/\.+$/, ''); // Remove trailing dots
          
          // Clean values
          let value = item[key];
          if (typeof value === 'string') {
            value = value.trim();
            if (value === '') value = null; // Convert empty strings to null
          }
          
          cleanedItem[cleanedKey] = value;
        }
      }

      return {
        id: uuidv4(), // Generate unique ID instead of sheet-based index
        category: sheetName,
        ...cleanedItem
      };
    });

    allCases = [...allCases, ...processedData];
    console.log(`✔️ Processed ${processedData.length} cases from ${sheetName}`);
  });

  // Validate we have data
  if (allCases.length === 0) {
    throw new Error('No cases were processed - check your Excel file format');
  }

  // Write output
  fs.writeFileSync(outputPath, JSON.stringify(allCases, null, 2));
  console.log(`\n✅ Success! Processed ${allCases.length} total cases.`);
  console.log(`📁 Output written to: ${outputPath}`);

} catch (error) {
  console.error('\n❌ Conversion failed:', error.message);
  process.exit(1);
}