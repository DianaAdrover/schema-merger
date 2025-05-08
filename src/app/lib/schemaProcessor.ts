// src/app/lib/schemaProcessor.ts
import {JsonSchema, merge} from 'allof-merge';
import yaml from 'js-yaml';
import RefParser from '@apidevtools/json-schema-ref-parser';

export async function processSchema(yamlInput: string): Promise<{ names: string[], schemas: Record<string, object> }> {
    const inputSchema = yaml.load(yamlInput) as JsonSchema;
    if (!inputSchema) throw new Error("Invalid or empty YAML input");

    const parser = new RefParser();
    const dereferencedSchema = await parser.dereference(inputSchema);

    const onMergeError = (msg: string) => { throw new Error(msg); };
    const mergedSchema = merge(dereferencedSchema, { onMergeError }) as JsonSchema;

    const components = mergedSchema.components?.schemas || {};
    const result: Record<string, object> = {};

    for (const [name, schema] of Object.entries(components)) {
        result[name] = {
            $schema: "http://json-schema.org/draft-04/schema#",
            id: `http://finxact.com/product/schemas/${name}.json`,
            title: name,
            description: (schema as JsonSchema).description || `Schema for ${name}`,
            type: (schema as JsonSchema).type || "object",
            properties: (schema as JsonSchema).properties || {},
            required: (schema as JsonSchema).required || [],
        };
    }

    return { names: Object.keys(result), schemas: result };
}
