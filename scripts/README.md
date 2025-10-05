# Judgment Extraction Script

This script extracts text from DOCX and PDF files containing reported judgments and converts them into a structured JSON format.

## How It Works

1. **Reads Files**: Scans both `Reported Judgments for Website/docx` and `Reported Judgments for Website/pdfs` folders
2. **Handles Multiple Judgments**: Automatically detects files with multiple judgments (e.g., `21,22,23.docx` or `28 TO 39.docx`)
3. **Extracts Text**:
   - Uses `mammoth` for DOCX files
   - Uses `pdf-parse` for PDF files
4. **Parses Structure**: Intelligently extracts:
   - Citation (e.g., "2012 P T D 44")
   - Court name
   - Parties (petitioner vs respondent)
   - Case number
   - Date
   - Judges
   - Legal sections
   - Subject/Law
   - Keywords
   - Full text
5. **Generates JSON**: Creates `public/data/reported-judgments.json` with all 69 judgments

## Usage

Run the extraction script:

```bash
npm run extract-judgments
```

Or directly:

```bash
node scripts/extract-judgments.js
```

## When to Re-run

Re-run this script whenever:
- New judgment files are added to the folders
- Existing judgment files are updated
- You need to regenerate the JSON data

## Output

- **File**: `public/data/reported-judgments.json`
- **Size**: ~1.2MB (for 69 judgments)
- **Format**: Array of judgment objects with structured data

## File Naming Conventions

The script understands these patterns:
- `1.docx` → Single judgment (ID: 1)
- `21,22,23.docx` → Multiple judgments (IDs: 21, 22, 23)
- `28 TO 39.docx` → Range of judgments (IDs: 28-39)
- `57,58,59,60,61.pdf` → Multiple judgments in PDF (IDs: 57-61)

## Technical Details

- **DOCX Extraction**: Uses `mammoth` library for raw text extraction
- **PDF Extraction**: Uses `pdf-parse` library for text extraction
- **Parsing**: Regex-based extraction of structured elements
- **Multi-judgment Splitting**: Attempts to split files with multiple judgments based on common patterns

## Troubleshooting

If judgments aren't extracted correctly:
1. Check the file naming follows the conventions above
2. Ensure files are in correct folders (`docx` or `pdfs`)
3. Verify file format is valid DOCX or PDF
4. Check console output for specific error messages
