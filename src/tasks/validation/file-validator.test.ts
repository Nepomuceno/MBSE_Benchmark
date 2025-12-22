import { describe, test, expect } from "bun:test";
import { createVirtualFS } from "../../filesystem/virtual-fs.js";
import { validateExpectedFiles } from "./file-validator.js";
import type { ExpectedFile } from "../types.js";

describe("validateExpectedFiles", () => {
  describe("exists validation", () => {
    test("passes when file exists and expected", () => {
      const fs = createVirtualFS({ "test.txt": "content" });
      const expected: ExpectedFile[] = [
        { path: "test.txt", validation: { type: "exists", value: true } },
      ];

      const results = validateExpectedFiles(expected, { fs });
      expect(results[0]!.passed).toBe(true);
    });

    test("fails when file missing but expected", () => {
      const fs = createVirtualFS();
      const expected: ExpectedFile[] = [
        { path: "missing.txt", validation: { type: "exists", value: true } },
      ];

      const results = validateExpectedFiles(expected, { fs });
      expect(results[0]!.passed).toBe(false);
    });

    test("passes when file missing and not expected", () => {
      const fs = createVirtualFS();
      const expected: ExpectedFile[] = [
        { path: "missing.txt", validation: { type: "exists", value: false } },
      ];

      const results = validateExpectedFiles(expected, { fs });
      expect(results[0]!.passed).toBe(true);
    });
  });

  describe("exact validation", () => {
    test("passes on exact match", () => {
      const fs = createVirtualFS({ "test.txt": "exact content" });
      const expected: ExpectedFile[] = [
        { path: "test.txt", validation: { type: "exact", content: "exact content" } },
      ];

      const results = validateExpectedFiles(expected, { fs });
      expect(results[0]!.passed).toBe(true);
    });

    test("fails on mismatch", () => {
      const fs = createVirtualFS({ "test.txt": "actual content" });
      const expected: ExpectedFile[] = [
        { path: "test.txt", validation: { type: "exact", content: "expected content" } },
      ];

      const results = validateExpectedFiles(expected, { fs });
      expect(results[0]!.passed).toBe(false);
    });
  });

  describe("contains validation", () => {
    test("passes when all substrings found", () => {
      const fs = createVirtualFS({ "test.txt": "hello world foo bar" });
      const expected: ExpectedFile[] = [
        {
          path: "test.txt",
          validation: { type: "contains", substrings: ["hello", "world"] },
        },
      ];

      const results = validateExpectedFiles(expected, { fs });
      expect(results[0]!.passed).toBe(true);
    });

    test("fails when substring missing", () => {
      const fs = createVirtualFS({ "test.txt": "hello world" });
      const expected: ExpectedFile[] = [
        {
          path: "test.txt",
          validation: { type: "contains", substrings: ["hello", "missing"] },
        },
      ];

      const results = validateExpectedFiles(expected, { fs });
      expect(results[0]!.passed).toBe(false);
      expect(results[0]!.message).toContain("missing");
    });

    test("passes with all=false when any substring found", () => {
      const fs = createVirtualFS({ "test.txt": "hello world" });
      const expected: ExpectedFile[] = [
        {
          path: "test.txt",
          validation: { type: "contains", substrings: ["hello", "missing"], all: false },
        },
      ];

      const results = validateExpectedFiles(expected, { fs });
      expect(results[0]!.passed).toBe(true);
    });
  });

  describe("regex validation", () => {
    test("passes when patterns match", () => {
      const fs = createVirtualFS({ "test.txt": "REQ-001: The system shall..." });
      const expected: ExpectedFile[] = [
        {
          path: "test.txt",
          validation: { type: "regex", patterns: ["REQ-\\d+", "shall"] },
        },
      ];

      const results = validateExpectedFiles(expected, { fs });
      expect(results[0]!.passed).toBe(true);
    });

    test("fails when pattern not matched", () => {
      const fs = createVirtualFS({ "test.txt": "no match here" });
      const expected: ExpectedFile[] = [
        {
          path: "test.txt",
          validation: { type: "regex", patterns: ["REQ-\\d+"] },
        },
      ];

      const results = validateExpectedFiles(expected, { fs });
      expect(results[0]!.passed).toBe(false);
    });
  });

  describe("json-schema validation", () => {
    test("passes when JSON matches schema", () => {
      const fs = createVirtualFS({
        "data.json": JSON.stringify({ name: "test", value: 42 }),
      });
      const expected: ExpectedFile[] = [
        {
          path: "data.json",
          validation: {
            type: "json-schema",
            schema: {
              type: "object",
              properties: {
                name: { type: "string" },
                value: { type: "number" },
              },
              required: ["name"],
            },
          },
        },
      ];

      const results = validateExpectedFiles(expected, { fs });
      expect(results[0]!.passed).toBe(true);
    });

    test("fails when required property missing", () => {
      const fs = createVirtualFS({
        "data.json": JSON.stringify({ value: 42 }),
      });
      const expected: ExpectedFile[] = [
        {
          path: "data.json",
          validation: {
            type: "json-schema",
            schema: {
              type: "object",
              properties: { name: { type: "string" } },
              required: ["name"],
            },
          },
        },
      ];

      const results = validateExpectedFiles(expected, { fs });
      expect(results[0]!.passed).toBe(false);
      expect(results[0]!.message).toContain("name");
    });

    test("fails on invalid JSON", () => {
      const fs = createVirtualFS({ "data.json": "not json" });
      const expected: ExpectedFile[] = [
        {
          path: "data.json",
          validation: { type: "json-schema", schema: { type: "object" } },
        },
      ];

      const results = validateExpectedFiles(expected, { fs });
      expect(results[0]!.passed).toBe(false);
      expect(results[0]!.message).toContain("not valid JSON");
    });
  });

  describe("multiple files", () => {
    test("validates all files", () => {
      const fs = createVirtualFS({
        "file1.txt": "content1",
        "file2.txt": "content2",
      });
      const expected: ExpectedFile[] = [
        { path: "file1.txt", validation: { type: "exists", value: true } },
        { path: "file2.txt", validation: { type: "contains", substrings: ["content2"] } },
        { path: "file3.txt", validation: { type: "exists", value: false } },
      ];

      const results = validateExpectedFiles(expected, { fs });
      expect(results).toHaveLength(3);
      expect(results.every((r) => r.passed)).toBe(true);
    });
  });
});
