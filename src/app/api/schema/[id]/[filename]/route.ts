// src/app/api/schema/[id]/[filename]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getSchema } from '@/app/lib/schemaStore';

export async function GET(request: NextRequest) {
    try {
        const segments = request.nextUrl.pathname.split('/');
        const filename = segments.pop();
        const id = segments.pop();

        if (!id || !filename) {
            return NextResponse.json({ error: 'Missing id or filename in URL' }, { status: 400 });
        }

        // Use the new getSchema function instead of getSchemaSet
        const schemaContent = getSchema(id, filename);

        if (!schemaContent) {
            return NextResponse.json({ error: 'Schema not found' }, { status: 404 });
        }

        // Return the pre-serialized schema directly
        return NextResponse.json({ content: schemaContent });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
