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

    test("index contains sysml tasks", async () => {
      const index = await loadTaskIndex(basePath);
      expect(index.tasks).toContain("sysml-valid-detection-001");
    });
  });

  describe("loadTask", () => {
    test("loads sysml-valid-detection-001", async () => {
      const task = await loadTask("sysml-valid-detection-001", basePath);
      expect(task.id).toBe("sysml-valid-detection-001");
      expect(task.type).toBe("qa");
      expect(task.name).toBeDefined();
      expect(task.prompt).toBeDefined();
    });

    test("loads initial files", async () => {
      const task = await loadTask("sysml-valid-detection-001", basePath);
      expect(task.initialFiles).toBeDefined();
      expect(task.initialFiles["input.sysml"]).toBeDefined();
      expect(task.initialFiles["input.sysml"]).toContain("port def");
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
      expect(ids).toContain("sysml-valid-detection-001");
    });
  });

  describe("getTaskIds", () => {
    test("returns task IDs", async () => {
      const ids = await getTaskIds(basePath);
      expect(Array.isArray(ids)).toBe(true);
      expect(ids).toContain("sysml-valid-detection-001");
    });
  });
});
