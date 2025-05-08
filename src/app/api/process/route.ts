// src/app/api/process/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { processSchema } from '@/app/lib/schemaProcessor';

export async function POST(req: NextRequest) {
    try {
        const { yamlInput } = await req.json();
        const files = await processSchema(yamlInput);
        return NextResponse.json({ files });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
