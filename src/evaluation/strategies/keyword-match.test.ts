import { describe, test, expect } from "bun:test";
import { createKeywordMatchStrategy } from "./keyword-match.js";
import type { Task } from "../../tasks/types.js";

describe("KeywordMatchStrategy", () => {
  const strategy = createKeywordMatchStrategy();

  const createTask = (keywords: string[]): Task => ({
    id: "test",
    type: "qa",
    name: "Test Task",
    description: "Test",
    prompt: "Test prompt",
    evaluation: {
      type: "keyword-match",
      weight: 1.0,
      keywords,
    },
  });

  test("returns 1.0 when all keywords found", async () => {
    const task = createTask(["model", "system", "engineering"]);
    const response = "Model-based Systems Engineering is a methodology";

    const result = await strategy.evaluate(response, task);

    expect(result.score).toBe(1);
    expect(result.details.matched).toContain("model");
    expect(result.details.matched).toContain("system");
    expect(result.details.matched).toContain("engineering");
    expect(result.details.missing).toHaveLength(0);
  });

  test("returns partial score for partial match", async () => {
    const task = createTask(["model", "missing", "engineering"]);
    const response = "Model-based engineering approach";

    const result = await strategy.evaluate(response, task);

    expect(result.score).toBeCloseTo(2 / 3);
    expect(result.details.matched).toContain("model");
    expect(result.details.matched).toContain("engineering");
    expect(result.details.missing).toContain("missing");
  });

  test("returns 0 when no keywords found", async () => {
    const task = createTask(["alpha", "beta", "gamma"]);
    const response = "This response has none of the keywords";

    const result = await strategy.evaluate(response, task);

    expect(result.score).toBe(0);
    expect(result.details.matched).toHaveLength(0);
    expect(result.details.missing).toHaveLength(3);
  });

  test("is case insensitive", async () => {
    const task = createTask(["MODEL", "SYSTEM"]);
    const response = "model and system";

    const result = await strategy.evaluate(response, task);

    expect(result.score).toBe(1);
  });

  test("returns 1.0 when no keywords specified", async () => {
    const task = createTask([]);
    const response = "Any response";

    const result = await strategy.evaluate(response, task);

    expect(result.score).toBe(1);
  });
});
