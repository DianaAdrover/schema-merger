// src/app/api/schema/[id]/[filename]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getSchemaSet } from '@/app/lib/schemaStore';

export async function GET(request: NextRequest, context: { params: { id: string; filename: string } }) {
    const { id, filename } = context.params;
    const schemaSet = getSchemaSet(id);
    if (!schemaSet) return NextResponse.json({ error: 'Session not found' }, { status: 404 });

    const schema = schemaSet[filename];
    if (!schema) return NextResponse.json({ error: 'File not found' }, { status: 404 });

    return NextResponse.json({ content: JSON.stringify(schema, null, 2) });
}
