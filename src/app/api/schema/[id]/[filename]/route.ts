// src/app/api/schema/[id]/[filename]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getSchemaSet } from '@/app/lib/schemaStore';

export async function GET(request: NextRequest) {
    try {
        const segments = request.nextUrl.pathname.split('/');
        const filename = segments.pop();
        const id = segments.pop();

        if (!id || !filename) {
            return NextResponse.json({ error: 'Missing id or filename in URL' }, { status: 400 });
        }

        const schemaSet = getSchemaSet(id);
        if (!schemaSet) {
            return NextResponse.json({ error: 'Session not found' }, { status: 404 });
        }

        const schema = schemaSet[filename];
        if (!schema) {
            return NextResponse.json({ error: 'File not found' }, { status: 404 });
        }

        return NextResponse.json({ content: JSON.stringify(schema, null, 2) });
    } catch (error) {
        return NextResponse.json({ error: error }, { status: 500 });
    }
}
