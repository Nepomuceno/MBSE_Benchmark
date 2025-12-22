import { describe, test, expect } from "bun:test";
import { createFileValidationStrategy } from "./file-validation.js";
import { createVirtualFS } from "../../filesystem/virtual-fs.js";
import type { Task } from "../../tasks/types.js";

describe("FileValidationStrategy", () => {
  const strategy = createFileValidationStrategy();

  const createTask = (expected: Task["files"]): Task => ({
    id: "test",
    type: "generation",
    name: "Test Task",
    description: "Test",
    prompt: "Test prompt",
    files: expected,
    evaluation: {
      type: "file-validation",
      weight: 1.0,
    },
  });

  test("returns 1.0 when all files exist", async () => {
    const fs = createVirtualFS({
      "output.txt": "content",
      "data.json": '{"key": "value"}',
    });

    const task = createTask({
      expected: [
        { path: "output.txt", validation: { type: "exists", value: true } },
        { path: "data.json", validation: { type: "exists", value: true } },
      ],
    });

    const result = await strategy.evaluate("", task, { fs });

    expect(result.score).toBe(1);
    expect(result.details.matched).toContain("output.txt");
    expect(result.details.matched).toContain("data.json");
  });

  test("returns partial score for partial match", async () => {
    const fs = createVirtualFS({
      "output.txt": "content",
    });

    const task = createTask({
      expected: [
        { path: "output.txt", validation: { type: "exists", value: true } },
        { path: "missing.txt", validation: { type: "exists", value: true } },
      ],
    });

    const result = await strategy.evaluate("", task, { fs });

    expect(result.score).toBe(0.5);
  });

  test("validates contains", async () => {
    const fs = createVirtualFS({
      "requirements.txt": "REQ-001: First requirement\nREQ-002: Second requirement",
    });

    const task = createTask({
      expected: [
        {
          path: "requirements.txt",
          validation: { type: "contains", substrings: ["REQ-001", "REQ-002"] },
        },
      ],
    });

    const result = await strategy.evaluate("", task, { fs });

    expect(result.score).toBe(1);
  });

  test("validates regex", async () => {
    const fs = createVirtualFS({
      "output.txt": "REQ-001: The system shall do something",
    });

    const task = createTask({
      expected: [
        {
          path: "output.txt",
          validation: { type: "regex", patterns: ["REQ-\\d{3}:", "shall"] },
        },
      ],
    });

    const result = await strategy.evaluate("", task, { fs });

    expect(result.score).toBe(1);
  });

  test("returns 1.0 when no expected files", async () => {
    const fs = createVirtualFS();

    const task = createTask({});

    const result = await strategy.evaluate("", task, { fs });

    expect(result.score).toBe(1);
  });

  test("returns 0 when no fs context", async () => {
    const task = createTask({
      expected: [{ path: "test.txt", validation: { type: "exists", value: true } }],
    });

    const result = await strategy.evaluate("", task, {});

    expect(result.score).toBe(0);
  });
});
