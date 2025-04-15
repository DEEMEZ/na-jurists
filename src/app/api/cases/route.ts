// app/api/cases/route.ts
import { promises as fs } from 'fs';
import path from 'path';
import { read, utils } from 'xlsx';

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), 'public', 'data', 'CASES List.xlsx');
    const file = await fs.readFile(filePath);
    const workbook = read(file);
    
    const sheetName = workbook.SheetNames[0]; // or your sheet name
    const worksheet = workbook.Sheets[sheetName];
    const data = utils.sheet_to_json(worksheet);
    
    return Response.json(data);
  } catch (error) {
    return Response.json({ error: 'Failed to load cases' }, { status: 500 });
  }
}