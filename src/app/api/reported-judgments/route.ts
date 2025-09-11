import { promises as fs } from 'fs';
import path from 'path';

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), 'public', 'data', 'reported-judgments.json');
    const file = await fs.readFile(filePath, 'utf8');
    const data = JSON.parse(file);
    
    return Response.json(data);
  } catch (error) {
    console.error('Failed to load reported judgments:', error);
    return Response.json({ error: 'Failed to load reported judgments' }, { status: 500 });
  }
}