import { describe, test, expect } from "bun:test";
import { computeTaskScore, aggregateScores } from "./scorer.js";
import type { Task } from "../tasks/types.js";
import type { EvaluationResult } from "./types.js";

describe("scorer", () => {
  describe("computeTaskScore", () => {
    test("computes weighted score", () => {
      const evaluation: EvaluationResult = {
        score: 0.8,
        details: {},
      };
      const task: Task = {
        id: "test",
        type: "qa",
        name: "Test",
        description: "Test",
        prompt: "Test",
        evaluation: { type: "keyword-match", weight: 2.0 },
      };

      const result = computeTaskScore("test", evaluation, task);

      expect(result.rawScore).toBe(0.8);
      expect(result.weight).toBe(2.0);
      expect(result.weightedScore).toBe(1.6);
    });
  });

  describe("aggregateScores", () => {
    test("computes weighted average", () => {
      const scores = [
        {
          taskId: "task1",
          rawScore: 1.0,
          weight: 1.0,
          weightedScore: 1.0,
          evaluation: { score: 1.0, details: {} },
        },
        {
          taskId: "task2",
          rawScore: 0.5,
          weight: 2.0,
          weightedScore: 1.0,
          evaluation: { score: 0.5, details: {} },
        },
        {
          taskId: "task3",
          rawScore: 0.0,
          weight: 1.0,
          weightedScore: 0.0,
          evaluation: { score: 0.0, details: {} },
        },
      ];

      const result = aggregateScores(scores);

      // (1.0 + 1.0 + 0.0) / (1.0 + 2.0 + 1.0) = 2.0 / 4.0 = 0.5
      expect(result.overall).toBe(0.5);
      expect(result.totalWeight).toBe(4.0);
      expect(result.tasks).toHaveLength(3);
    });

    test("returns 0 for empty scores", () => {
      const result = aggregateScores([]);

      expect(result.overall).toBe(0);
      expect(result.totalWeight).toBe(0);
    });

    test("handles single task", () => {
      const scores = [
        {
          taskId: "task1",
          rawScore: 0.75,
          weight: 1.0,
          weightedScore: 0.75,
          evaluation: { score: 0.75, details: {} },
        },
      ];

      const result = aggregateScores(scores);

      expect(result.overall).toBe(0.75);
    });
  });
});
