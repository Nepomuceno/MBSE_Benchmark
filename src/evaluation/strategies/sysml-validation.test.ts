import { describe, test, expect } from "bun:test";
import { createSysmlValidationStrategy } from "./sysml-validation.js";
import type { Task } from "../../tasks/types.js";

describe("SysmlValidationStrategy", () => {
  const strategy = createSysmlValidationStrategy();

  const createTask = (evalConfig: Record<string, unknown>): Task => ({
    id: "test",
    type: "generation",
    name: "Test Task",
    description: "Test",
    prompt: "Generate SysML",
    evaluation: {
      type: "sysml-validation",
      weight: 1.0,
      ...evalConfig,
    },
  });

  describe("syntax validation", () => {
    test("returns 1.0 for valid SysML syntax", async () => {
      const task = createTask({ checkSyntax: true });
      const response = `
        package Vehicle {
          part def Engine {
            attribute power : Real;
          }
        }
      `;

      const result = await strategy.evaluate(response, task);

      expect(result.score).toBe(1);
      expect(result.details.criteria).toHaveLength(1);
      expect(result.details.criteria![0]!.name).toBe("syntax");
      expect(result.details.criteria![0]!.score).toBe(1);
    });

    test("returns 0 for invalid SysML syntax", async () => {
      const task = createTask({ checkSyntax: true });
      const response = `
        package Vehicle {
          part def Engine {
            attribute power : Real;
          // missing closing braces
      `;

      const result = await strategy.evaluate(response, task);

      expect(result.score).toBe(0);
      expect(result.details.criteria![0]!.score).toBe(0);
    });
  });

  describe("structure validation", () => {
    test("returns 1.0 for matching structure", async () => {
      const expectedModel = `
        package Vehicle {
          part def Engine;
          part def Wheel;
        }
      `;

      const task = createTask({
        checkSyntax: false,
        checkStructure: true,
        expectedModel,
      });

      const response = `
        package Vehicle {
          part def Engine;
          part def Wheel;
        }
      `;

      const result = await strategy.evaluate(response, task);

      expect(result.score).toBe(1);
      expect(result.details.criteria![0]!.name).toBe("structure");
    });

    test("returns partial score for partial match", async () => {
      const expectedModel = `
        package Vehicle {
          part def Engine;
          part def Wheel;
          part def Body;
        }
      `;

      const task = createTask({
        checkSyntax: false,
        checkStructure: true,
        expectedModel,
      });

      const response = `
        package Vehicle {
          part def Engine;
          part def Wheel;
        }
      `;

      const result = await strategy.evaluate(response, task);

      expect(result.score).toBeLessThan(1);
      expect(result.score).toBeGreaterThan(0);
    });
  });

  describe("element extraction validation", () => {
    test("returns 1.0 when all expected elements found", async () => {
      const task = createTask({
        checkSyntax: false,
        checkElements: true,
        expectedElements: {
          partDefs: [
            { name: "Engine", attributes: [], ports: [], actions: [], parts: [] },
            { name: "Wheel", attributes: [], ports: [], actions: [], parts: [] },
          ],
        },
      });

      const response = `
        package Vehicle {
          part def Engine;
          part def Wheel;
        }
      `;

      const result = await strategy.evaluate(response, task);

      expect(result.score).toBe(1);
    });

    test("returns partial score for missing elements", async () => {
      const task = createTask({
        checkSyntax: false,
        checkElements: true,
        expectedElements: {
          partDefs: [
            { name: "Engine", attributes: [], ports: [], actions: [], parts: [] },
            { name: "Wheel", attributes: [], ports: [], actions: [], parts: [] },
            { name: "Body", attributes: [], ports: [], actions: [], parts: [] },
          ],
        },
      });

      const response = `
        package Vehicle {
          part def Engine;
          part def Wheel;
        }
      `;

      const result = await strategy.evaluate(response, task);

      expect(result.score).toBeLessThan(1);
    });
  });

  describe("combined validation", () => {
    test("combines syntax and structure scores", async () => {
      const expectedModel = `
        package Vehicle {
          part def Engine;
        }
      `;

      const task = createTask({
        checkSyntax: true,
        checkStructure: true,
        expectedModel,
        syntaxWeight: 1,
        structureWeight: 1,
      });

      const response = `
        package Vehicle {
          part def Engine;
        }
      `;

      const result = await strategy.evaluate(response, task);

      expect(result.score).toBe(1);
      expect(result.details.criteria).toHaveLength(2);
    });

    test("applies weights correctly", async () => {
      const expectedModel = `
        package Vehicle {
          part def Engine;
          part def Wheel;
        }
      `;

      const task = createTask({
        checkSyntax: true,
        checkStructure: true,
        expectedModel,
        syntaxWeight: 3,
        structureWeight: 1,
      });

      // Valid syntax but structure is different (missing Wheel)
      const response = `
        package Vehicle {
          part def Engine;
        }
      `;

      const result = await strategy.evaluate(response, task);

      // Syntax: 1.0 * 3 = 3
      // Structure: ~0.67 * 1 = 0.67 (2 of 3 nodes matched)
      // Total: (3 + 0.67) / 4 = ~0.92
      expect(result.score).toBeGreaterThan(0.8);
      expect(result.score).toBeLessThan(1);
    });
  });

  describe("explanation", () => {
    test("provides meaningful explanation", async () => {
      const task = createTask({ checkSyntax: true });
      const response = `package Test { part def A; }`;

      const result = await strategy.evaluate(response, task);

      expect(result.explanation).toContain("SysML validation");
      expect(result.explanation).toContain("100%");
    });
  });
});
