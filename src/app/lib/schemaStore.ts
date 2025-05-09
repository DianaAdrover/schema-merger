// src/app/lib/schemaStore.ts
import fastSafeStringify from 'fast-safe-stringify';

// Define a better type than any
type SchemaObject = Record<string, unknown>;

// Store pre-serialized JSON strings instead of objects
const schemaStore = new Map<string, Map<string, string>>();

export function saveSchema(id: string, name: string, schema: SchemaObject): void {
    if (!schemaStore.has(id)) {
        schemaStore.set(id, new Map());
    }

    // Fix: Use undefined instead of null for the replacer parameter
    const serializedSchema = fastSafeStringify(schema, undefined, 2);
    schemaStore.get(id)!.set(name, serializedSchema);
}

// Save multiple schemas at once
export function saveSchemaSet(id: string, schemas: Record<string, SchemaObject>): void {
    Object.entries(schemas).forEach(([name, schema]) => {
        saveSchema(id, name, schema);
    });
}

// Get a specific schema by name
export function getSchema(id: string, name: string): string | undefined {
    return schemaStore.get(id)?.get(name);
}

// Get schema names for an ID
export function getSchemaNames(id: string): string[] {
    return schemaStore.has(id)
        ? Array.from(schemaStore.get(id)!.keys())
        : [];
}

// Get entire schema set (mostly for backward compatibility)
export function getSchemaSet(id: string): Map<string, string> | undefined {
    return schemaStore.get(id);
}
