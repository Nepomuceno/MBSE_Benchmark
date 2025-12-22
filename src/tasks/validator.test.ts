import { describe, test, expect } from "bun:test";
import { validateTask, isValidTask } from "./validator.js";

describe("validateTask", () => {
  const validTask = {
    id: "test-task",
    type: "qa",
    name: "Test Task",
    description: "A test task",
    prompt: "What is MBSE?",
    evaluation: {
      type: "keyword-match",
      weight: 1.0,
    },
  };

  describe("valid tasks", () => {
    test("accepts minimal valid task", () => {
      const result = validateTask(validTask);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test("accepts task with optional fields", () => {
      const task = {
        ...validTask,
        context: "Additional context",
        maxTokens: 500,
      };
      const result = validateTask(task);
      expect(result.valid).toBe(true);
    });

    test("accepts all task types", () => {
      for (const type of ["qa", "analysis", "generation"]) {
        const task = { ...validTask, type };
        const result = validateTask(task);
        expect(result.valid).toBe(true);
      }
    });

    test("accepts task with files config", () => {
      const task = {
        ...validTask,
        files: {
          initial: "files",
          expected: [
            {
              path: "output.txt",
              validation: { type: "exists", value: true },
            },
          ],
        },
      };
      const result = validateTask(task);
      expect(result.valid).toBe(true);
    });
  });

  describe("invalid tasks", () => {
    test("rejects non-object", () => {
      expect(validateTask(null).valid).toBe(false);
      expect(validateTask("string").valid).toBe(false);
      expect(validateTask(123).valid).toBe(false);
    });

    test("rejects missing id", () => {
      const task = { ...validTask };
      delete (task as Record<string, unknown>).id;
      const result = validateTask(task);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain("Task must have a string 'id'");
    });

    test("rejects missing type", () => {
      const task = { ...validTask };
      delete (task as Record<string, unknown>).type;
      const result = validateTask(task);
      expect(result.valid).toBe(false);
    });

    test("rejects invalid type", () => {
      const task = { ...validTask, type: "invalid" };
      const result = validateTask(task);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes("Invalid task type"))).toBe(true);
    });

    test("rejects missing evaluation", () => {
      const task = { ...validTask };
      delete (task as Record<string, unknown>).evaluation;
      const result = validateTask(task);
      expect(result.valid).toBe(false);
    });

    test("rejects invalid evaluation type", () => {
      const task = {
        ...validTask,
        evaluation: { type: "invalid", weight: 1.0 },
      };
      const result = validateTask(task);
      expect(result.valid).toBe(false);
    });

    test("rejects missing evaluation weight", () => {
      const task = {
        ...validTask,
        evaluation: { type: "keyword-match" },
      };
      const result = validateTask(task);
      expect(result.valid).toBe(false);
    });

    test("rejects invalid files.expected", () => {
      const task = {
        ...validTask,
        files: {
          expected: [
            { path: "test.txt" }, // missing validation
          ],
        },
      };
      const result = validateTask(task);
      expect(result.valid).toBe(false);
    });

    test("rejects invalid file validation type", () => {
      const task = {
        ...validTask,
        files: {
          expected: [
            {
              path: "test.txt",
              validation: { type: "invalid-type" },
            },
          ],
        },
      };
      const result = validateTask(task);
      expect(result.valid).toBe(false);
    });
  });

  describe("isValidTask", () => {
    test("returns true for valid task", () => {
      expect(isValidTask(validTask)).toBe(true);
    });

    test("returns false for invalid task", () => {
      expect(isValidTask({})).toBe(false);
    });
  });
});
