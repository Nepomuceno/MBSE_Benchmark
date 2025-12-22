import type { VirtualFileSystem } from "../../filesystem/types.js";
import type {
  ExpectedFile,
  FileValidation,
  ExistsValidation,
  ExactValidation,
  ContainsValidation,
  RegexValidation,
  JsonSchemaValidation,
} from "../types.js";

export interface FileValidationResult {
  path: string;
  passed: boolean;
  message: string;
}

export interface ValidationContext {
  fs: VirtualFileSystem;
}

export function validateExpectedFiles(
  expectedFiles: ExpectedFile[],
  ctx: ValidationContext
): FileValidationResult[] {
  return expectedFiles.map((expected) => validateFile(expected, ctx));
}

function validateFile(
  expected: ExpectedFile,
  ctx: ValidationContext
): FileValidationResult {
  const { path, validation } = expected;

  try {
    switch (validation.type) {
      case "exists":
        return validateExists(path, validation, ctx);
      case "exact":
        return validateExact(path, validation, ctx);
      case "contains":
        return validateContains(path, validation, ctx);
      case "regex":
        return validateRegex(path, validation, ctx);
      case "json-schema":
        return validateJsonSchema(path, validation, ctx);
      case "llm-judge":
        // LLM judge requires async and model access, handled separately
        return {
          path,
          passed: true,
          message: "LLM judge validation deferred",
        };
      default:
        return {
          path,
          passed: false,
          message: `Unknown validation type: ${(validation as FileValidation).type}`,
        };
    }
  } catch (e) {
    return {
      path,
      passed: false,
      message: e instanceof Error ? e.message : "Validation failed",
    };
  }
}

function validateExists(
  path: string,
  validation: ExistsValidation,
  ctx: ValidationContext
): FileValidationResult {
  const exists = ctx.fs.exists(path);
  const expected = validation.value;

  if (exists === expected) {
    return {
      path,
      passed: true,
      message: expected ? "File exists as expected" : "File does not exist as expected",
    };
  }

  return {
    path,
    passed: false,
    message: expected
      ? `File should exist but was not found`
      : `File should not exist but was found`,
  };
}

function validateExact(
  path: string,
  validation: ExactValidation,
  ctx: ValidationContext
): FileValidationResult {
  if (!ctx.fs.exists(path)) {
    return { path, passed: false, message: "File not found" };
  }

  const content = ctx.fs.readFile(path);
  if (content === validation.content) {
    return { path, passed: true, message: "Content matches exactly" };
  }

  return {
    path,
    passed: false,
    message: "Content does not match expected value",
  };
}

function validateContains(
  path: string,
  validation: ContainsValidation,
  ctx: ValidationContext
): FileValidationResult {
  if (!ctx.fs.exists(path)) {
    return { path, passed: false, message: "File not found" };
  }

  const content = ctx.fs.readFile(path);
  const mustMatchAll = validation.all !== false; // default true

  const results = validation.substrings.map((sub) => ({
    substring: sub,
    found: content.includes(sub),
  }));

  const allFound = results.every((r) => r.found);
  const someFound = results.some((r) => r.found);
  const passed = mustMatchAll ? allFound : someFound;

  if (passed) {
    return { path, passed: true, message: "Content contains required substrings" };
  }

  const missing = results.filter((r) => !r.found).map((r) => r.substring);
  return {
    path,
    passed: false,
    message: `Missing substrings: ${missing.join(", ")}`,
  };
}

function validateRegex(
  path: string,
  validation: RegexValidation,
  ctx: ValidationContext
): FileValidationResult {
  if (!ctx.fs.exists(path)) {
    return { path, passed: false, message: "File not found" };
  }

  const content = ctx.fs.readFile(path);
  const mustMatchAll = validation.all !== false; // default true

  const results = validation.patterns.map((pattern) => {
    try {
      const regex = new RegExp(pattern);
      return { pattern, matches: regex.test(content) };
    } catch {
      return { pattern, matches: false, error: "Invalid regex" };
    }
  });

  const allMatch = results.every((r) => r.matches);
  const someMatch = results.some((r) => r.matches);
  const passed = mustMatchAll ? allMatch : someMatch;

  if (passed) {
    return { path, passed: true, message: "Content matches regex patterns" };
  }

  const failing = results.filter((r) => !r.matches).map((r) => r.pattern);
  return {
    path,
    passed: false,
    message: `Patterns not matched: ${failing.join(", ")}`,
  };
}

function validateJsonSchema(
  path: string,
  validation: JsonSchemaValidation,
  ctx: ValidationContext
): FileValidationResult {
  if (!ctx.fs.exists(path)) {
    return { path, passed: false, message: "File not found" };
  }

  const content = ctx.fs.readFile(path);

  let parsed: unknown;
  try {
    parsed = JSON.parse(content);
  } catch {
    return { path, passed: false, message: "File is not valid JSON" };
  }

  // Simple schema validation (check required properties exist)
  const schema = validation.schema;
  const errors: string[] = [];

  if (schema.type === "object" && schema.properties) {
    const props = schema.properties as Record<string, unknown>;
    const required = (schema.required as string[]) || [];

    for (const prop of required) {
      if ((parsed as Record<string, unknown>)[prop] === undefined) {
        errors.push(`Missing required property: ${prop}`);
      }
    }

    // Type checking for defined properties
    for (const [prop, propSchema] of Object.entries(props)) {
      const value = (parsed as Record<string, unknown>)[prop];
      if (value !== undefined) {
        const propType = (propSchema as Record<string, unknown>).type as string;
        if (propType) {
          const actualType = Array.isArray(value) ? "array" : typeof value;
          if (actualType !== propType) {
            errors.push(`Property ${prop} should be ${propType}, got ${actualType}`);
          }
        }
      }
    }
  }

  if (errors.length === 0) {
    return { path, passed: true, message: "JSON matches schema" };
  }

  return {
    path,
    passed: false,
    message: errors.join("; "),
  };
}
