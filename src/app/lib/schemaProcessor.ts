// src/lib/schemaProcessor.ts
import {JsonSchema, merge} from 'allof-merge';
import yaml from 'js-yaml';
import RefParser from '@apidevtools/json-schema-ref-parser';
import fastSafeStringify from 'fast-safe-stringify';
import { promises as fs } from 'fs';
import path from 'path';

export async function processSchema(yamlInput: string): Promise<string[]> {
    const inputSchema = yaml.load(yamlInput) as JsonSchema;
    if (!inputSchema) throw new Error("Invalid or empty YAML input");

    const parser = new RefParser();
    // We can use resolvedSchema if needed or remove it
    // const resolvedSchema = await parser.resolve(inputSchema);
    const dereferencedSchema = await parser.dereference(inputSchema);

    const onMergeError = (msg: string) => { throw new Error(msg); };
    const mergedSchema = merge(dereferencedSchema, { onMergeError }) as JsonSchema;

    const components = mergedSchema.components?.schemas || {};
    const filenames: string[] = [];

    await Promise.all(Object.entries(components).map(async ([name, schema]) => {
        const typedSchema = schema as JsonSchema;
        const fileName = `${name}.json`;
        const filePath = path.join(process.cwd(), 'public', 'schemas', fileName);

        // Write the schema to the file
        await fs.writeFile(filePath, fastSafeStringify({
            $schema: "http://json-schema.org/draft-04/schema#",
            id: `http://finxact.com/product/schemas/${name}.json`,
            title: name,
            description: typedSchema.description || `Schema for ${name}`,
            type: typedSchema.type || "object",
            properties: typedSchema.properties || {},
            required: typedSchema.required || []
        }, undefined, 2));

        filenames.push(fileName); // Add the filename to the result array
    }));

    return filenames; // Return the list of created file names
}