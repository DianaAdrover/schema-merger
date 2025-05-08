import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export async function GET(
    request: NextRequest,
    { params }: { params: { filename: string } }
) {
    try {
        // Safely access the filename parameter
        const filename = params.filename;
        const filePath = path.join(process.cwd(), 'public', 'schemas', filename);

        const content = await fs.readFile(filePath, 'utf-8');
        console.log(`Reading file: ${filename}, content length: ${content.length}`);
        return NextResponse.json({ content });
    } catch (error) {
        console.error(`File read error: ${error}`);
        return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }
}