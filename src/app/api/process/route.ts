// src/app/api/process/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { processSchema } from '@/app/lib/schemaProcessor';
import { saveSchemaSet } from '@/app/lib/schemaStore';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req: NextRequest) {
    try {
        const { yamlInput } = await req.json();
        const { schemas, names } = await processSchema(yamlInput);
        const id = uuidv4(); // unique session id
        saveSchemaSet(id, schemas);
        return NextResponse.json({ id, files: names });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
