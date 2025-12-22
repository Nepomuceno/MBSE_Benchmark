import { describe, test, expect } from "bun:test";
import { loadTask, loadTaskIndex, loadAllTasks, getTaskIds } from "./loader.js";

describe("loader", () => {
  const basePath = ".";

  describe("loadTaskIndex", () => {
    test("loads task index", async () => {
      const index = await loadTaskIndex(basePath);
      expect(index.version).toBeDefined();
      expect(Array.isArray(index.tasks)).toBe(true);
    });

    test("index contains sample-task", async () => {
      const index = await loadTaskIndex(basePath);
      expect(index.tasks).toContain("sample-task");
    });
  });

  describe("loadTask", () => {
    test("loads sample-task", async () => {
      const task = await loadTask("sample-task", basePath);
      expect(task.id).toBe("sample-task");
      expect(task.type).toBe("qa");
      expect(task.name).toBeDefined();
      expect(task.prompt).toBeDefined();
    });

    test("loads initial files", async () => {
      const task = await loadTask("sample-task", basePath);
      expect(task.initialFiles).toBeDefined();
      expect(task.initialFiles["README.md"]).toBeDefined();
      expect(task.initialFiles["README.md"]).toContain("MBSE");
    });

    test("throws for non-existent task", async () => {
      await expect(loadTask("non-existent", basePath)).rejects.toThrow();
    });
  });

  describe("loadAllTasks", () => {
    test("loads all tasks from index", async () => {
      const tasks = await loadAllTasks(basePath);
      expect(Array.isArray(tasks)).toBe(true);
      expect(tasks.length).toBeGreaterThan(0);

      const ids = tasks.map((t) => t.id);
      expect(ids).toContain("sample-task");
    });
  });

  describe("getTaskIds", () => {
    test("returns task IDs", async () => {
      const ids = await getTaskIds(basePath);
      expect(Array.isArray(ids)).toBe(true);
      expect(ids).toContain("sample-task");
    });
  });
});
