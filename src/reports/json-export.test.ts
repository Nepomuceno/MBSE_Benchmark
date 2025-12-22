import { describe, test, expect, beforeEach, afterEach } from "bun:test";
import { saveResult } from "./json-export.js";
import { existsSync, rmSync, readFileSync } from "fs";
import { join } from "path";

describe("saveResult", () => {
  const testResultsDir = "data/results-test";

  beforeEach(() => {
    // Clean up test directory before each test
    if (existsSync(testResultsDir)) {
      rmSync(testResultsDir, { recursive: true });
    }
  });

  afterEach(() => {
    // Clean up test directory after each test
    if (existsSync(testResultsDir)) {
      rmSync(testResultsDir, { recursive: true });
    }
  });

  test("creates version directory if it does not exist", () => {
    const result = {
      version: "0.1.0-202512221500",
      modelId: "test-model",
      score: 0.85,
    };

    const outputPath = saveResult(result, testResultsDir);

    expect(existsSync(join(testResultsDir, "0.1.0-202512221500"))).toBe(true);
    expect(outputPath).toBe(
      join(testResultsDir, "0.1.0-202512221500", "test-model.json")
    );
  });

  test("writes result as formatted JSON", () => {
    const result = {
      version: "0.1.0-202512221500",
      modelId: "test-model",
      score: 0.85,
      timestamp: "2025-12-22T15:00:00.000Z",
    };

    const outputPath = saveResult(result, testResultsDir);
    const content = readFileSync(outputPath, "utf-8");
    const parsed = JSON.parse(content);

    expect(parsed.version).toBe("0.1.0-202512221500");
    expect(parsed.modelId).toBe("test-model");
    expect(parsed.score).toBe(0.85);
    expect(parsed.timestamp).toBe("2025-12-22T15:00:00.000Z");
  });

  test("returns correct output path", () => {
    const result = {
      version: "0.1.0-202512221500",
      modelId: "gpt-4",
    };

    const outputPath = saveResult(result, testResultsDir);

    expect(outputPath).toBe(
      join(testResultsDir, "0.1.0-202512221500", "gpt-4.json")
    );
  });

  test("overwrites existing result file", () => {
    const result1 = {
      version: "0.1.0-202512221500",
      modelId: "test-model",
      score: 0.5,
    };
    const result2 = {
      version: "0.1.0-202512221500",
      modelId: "test-model",
      score: 0.9,
    };

    saveResult(result1, testResultsDir);
    saveResult(result2, testResultsDir);

    const outputPath = join(
      testResultsDir,
      "0.1.0-202512221500",
      "test-model.json"
    );
    const content = readFileSync(outputPath, "utf-8");
    const parsed = JSON.parse(content);

    expect(parsed.score).toBe(0.9);
  });
});
