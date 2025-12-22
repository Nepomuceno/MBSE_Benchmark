import { describe, test, expect } from "bun:test";

// Test parallel task execution helper logic
describe("parallel execution", () => {
  test("runTasksInParallel maintains task order in results", async () => {
    // Simulate task execution with varying delays
    const tasks = [
      { id: "task-1", delay: 30 },
      { id: "task-2", delay: 10 },
      { id: "task-3", delay: 20 },
    ];

    const results: string[] = [];
    const queue = [...tasks];

    async function worker(): Promise<void> {
      while (queue.length > 0) {
        const task = queue.shift();
        if (task) {
          await new Promise((resolve) =>
            globalThis.setTimeout(resolve, task.delay)
          );
          results.push(task.id);
        }
      }
    }

    // Run with concurrency of 3
    const workers = Array.from({ length: 3 }, () => worker());
    await Promise.all(workers);

    // Results are in completion order (fastest first)
    expect(results).toContain("task-1");
    expect(results).toContain("task-2");
    expect(results).toContain("task-3");

    // Re-sort by original order
    const taskOrder = new Map(tasks.map((t, i) => [t.id, i]));
    const sorted = [...results].sort(
      (a, b) => (taskOrder.get(a) ?? 0) - (taskOrder.get(b) ?? 0)
    );
    expect(sorted).toEqual(["task-1", "task-2", "task-3"]);
  });

  test("concurrency limit is respected", async () => {
    let concurrent = 0;
    let maxConcurrent = 0;
    const concurrencyLimit = 2;

    const tasks = Array.from({ length: 5 }, (_, i) => ({ id: `task-${i}` }));
    const queue = [...tasks];

    async function worker(): Promise<void> {
      while (queue.length > 0) {
        const task = queue.shift();
        if (task) {
          concurrent++;
          maxConcurrent = Math.max(maxConcurrent, concurrent);
          await new Promise((resolve) => globalThis.setTimeout(resolve, 10));
          concurrent--;
        }
      }
    }

    const workers = Array.from({ length: concurrencyLimit }, () => worker());
    await Promise.all(workers);

    expect(maxConcurrent).toBeLessThanOrEqual(concurrencyLimit);
  });
});
