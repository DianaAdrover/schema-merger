// src/app/lib/schemaStore.ts
const schemaStore = new Map<string, Record<string, object>>();

export function saveSchemaSet(id: string, schemas: Record<string, object>) {
    schemaStore.set(id, schemas);
}

export function getSchemaSet(id: string) {
    return schemaStore.get(id);
}
