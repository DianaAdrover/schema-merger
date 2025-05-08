import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export async function GET(
    request: NextRequest,
    context: { params: Record<string, string> }
) {
    try {
        const { filename } = context.params;
        const filePath = path.join(process.cwd(), 'public', 'schemas', filename);
        const content = await fs.readFile(filePath, 'utf-8');
        return NextResponse.json({ content });
    } catch (error) {
        return NextResponse.json({ error: 'File not found - ' + error }, { status: 404 });
    }
}

