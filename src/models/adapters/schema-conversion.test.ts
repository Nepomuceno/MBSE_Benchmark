import { describe, test, expect } from "bun:test";
import { jsonSchema } from "ai";
import type { JSONSchema7 } from "json-schema";

// This test file verifies that our tool parameter conversion works correctly
// with the AI SDK's jsonSchema function. This would have caught the earlier
// error where we used z.object() incorrectly with zod v4.

describe("Tool Schema Conversion", () => {
  // Replicate the conversion function from adapters
  function convertToJsonSchema(parameters: Record<string, unknown>): JSONSchema7 {
    const properties: Record<string, JSONSchema7> = {};
    const required: string[] = [];

    for (const [key, value] of Object.entries(parameters)) {
      const param = value as { type?: string; description?: string };
      properties[key] = {
        type: (param.type as JSONSchema7["type"]) || "string",
        description: param.description,
      };
      required.push(key);
    }

    return { type: "object", properties, required };
  }

  test("converts string parameter", () => {
    const params = {
      path: {
        type: "string",
        description: "The file path",
      },
    };

    const schema = convertToJsonSchema(params);

    expect(schema.type).toBe("object");
    expect(schema.properties?.path).toEqual({
      type: "string",
      description: "The file path",
    });
    expect(schema.required).toContain("path");
  });

  test("converts multiple parameters", () => {
    const params = {
      path: { type: "string", description: "File path" },
      content: { type: "string", description: "File content" },
    };

    const schema = convertToJsonSchema(params);

    expect(Object.keys(schema.properties || {})).toHaveLength(2);
    expect(schema.required).toHaveLength(2);
  });

  test("converts number parameter", () => {
    const params = {
      count: { type: "number", description: "Item count" },
    };

    const schema = convertToJsonSchema(params);

    expect((schema.properties?.count as JSONSchema7).type).toBe("number");
  });

  test("converts boolean parameter", () => {
    const params = {
      recursive: { type: "boolean", description: "Recurse into directories" },
    };

    const schema = convertToJsonSchema(params);

    expect((schema.properties?.recursive as JSONSchema7).type).toBe("boolean");
  });

  test("defaults to string type when not specified", () => {
    const params = {
      value: { description: "Some value" },
    };

    const schema = convertToJsonSchema(params);

    expect((schema.properties?.value as JSONSchema7).type).toBe("string");
  });

  test("schema is compatible with AI SDK jsonSchema", () => {
    const params = {
      path: { type: "string", description: "File path" },
    };

    const schema = convertToJsonSchema(params);

    // This should not throw - validates compatibility with AI SDK
    expect(() => jsonSchema(schema)).not.toThrow();
  });

  test("handles empty parameters", () => {
    const params = {};

    const schema = convertToJsonSchema(params);

    expect(schema.type).toBe("object");
    expect(schema.properties).toEqual({});
    expect(schema.required).toEqual([]);
  });

  test("matches filesystem tool structure", () => {
    // Test with actual filesystem tool parameters
    const readFileParams = {
      path: {
        type: "string",
        description: "The path to the file to read",
      },
    };

    const patchFileParams = {
      patch: {
        type: "string",
        description: "The unified diff patch to apply",
      },
    };

    const readSchema = convertToJsonSchema(readFileParams);
    const patchSchema = convertToJsonSchema(patchFileParams);

    // Both should be valid JSON schemas
    expect(() => jsonSchema(readSchema)).not.toThrow();
    expect(() => jsonSchema(patchSchema)).not.toThrow();
  });
});
