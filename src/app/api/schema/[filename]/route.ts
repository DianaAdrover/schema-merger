import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export async function GET(
    request: NextRequest,
    context: { params: Promise<{ filename: string }> }
) {
    // Await the params object before using it
    const params = await context.params;
    const filePath = path.join(process.cwd(), 'public', 'schemas', params.filename);

    try {
        const content = await fs.readFile(filePath, 'utf-8');
        console.log(`Reading file: ${params.filename}, content length: ${content.length}`);
        return NextResponse.json({ content });
    } catch (error) {
        console.error(`File read error: ${error}`);
        return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }
}