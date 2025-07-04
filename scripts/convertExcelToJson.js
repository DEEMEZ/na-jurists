/*const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

const inputPath = path.join(__dirname, '../public/data/CASES List.xlsx');
const outputPath = path.join(__dirname, '../public/data/cases.json');

if (!fs.existsSync(inputPath)) {
  console.error('❌ Excel file not found:', inputPath);
  process.exit(1);
}

try {
  const workbook = XLSX.readFile(inputPath);
  const sheetNames = workbook.SheetNames;
  let allCases = [];

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

    allCases = [...allCases, ...processedData];
  });

  fs.writeFileSync(outputPath, JSON.stringify(allCases, null, 2));
  console.log(`✔️ Success! Processed ${allCases.length} cases.`);
} catch (error) {
  console.error('❌ Conversion failed:', error);
  process.exit(1);
}*/