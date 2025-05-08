import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

// Use Request instead of NextRequest for better compatibility
export async function GET(
    request: Request,
    { params }: { params: { filename: string } }
) {
    try {
        const filePath = path.join(process.cwd(), 'public', 'schemas', params.filename);
        const content = await fs.readFile(filePath, 'utf-8');
        return NextResponse.json({ content });
    } catch (error) {
        console.error(`File read error: ${error}`);
        return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }
}