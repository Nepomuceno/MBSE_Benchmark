import React, { useState, useEffect } from "react";
import { Box, Text, useApp } from "ink";
import { runBenchmark, computeVersion } from "../../benchmark/index.js";
import { loadAllTasks } from "../../tasks/index.js";
import { saveResult } from "../../reports/index.js";
import { Progress, BenchmarkComplete } from "./Progress.js";
import type { BenchmarkResult } from "../../benchmark/index.js";

interface TaskProgress {
  taskId: string;
  score: number;
  latencyMs: number;
  status: "pending" | "running" | "completed" | "failed";
}

interface BenchmarkRunnerProps {
  modelId: string;
  force?: boolean;  // TODO: Implement cache invalidation when force=true
  verbose?: boolean;  // TODO: Implement verbose logging
}

export function BenchmarkRunner({ modelId, force: _force, verbose: _verbose }: BenchmarkRunnerProps) {
  const { exit } = useApp();
  const [status, setStatus] = useState<"loading" | "running" | "complete" | "error">("loading");
  const [tasks, setTasks] = useState<TaskProgress[]>([]);
  const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
  const [startTime] = useState(() => Date.now());
  const [version, setVersion] = useState("");
  const [result, setResult] = useState<BenchmarkResult | null>(null);
  const [outputPath, setOutputPath] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function run() {
      try {
        // Load version and tasks
        const ver = await computeVersion(".");
        setVersion(ver);

        const loadedTasks = await loadAllTasks(".");
        const taskProgress: TaskProgress[] = loadedTasks.map((t) => ({
          taskId: t.id,
          score: 0,
          latencyMs: 0,
          status: "pending" as const,
        }));
        setTasks(taskProgress);
        setStatus("running");

        // Run benchmark
        const benchResult = await runBenchmark(modelId, {
          version: ver,
          basePath: ".",
        });

        // Update task progress with results
        const finalProgress = taskProgress.map((tp) => {
          const taskResult = benchResult.tasks.find((t) => t.taskId === tp.taskId);
          if (taskResult) {
            return {
              ...tp,
              score: taskResult.score,
              latencyMs: taskResult.latencyMs,
              status: taskResult.error ? ("failed" as const) : ("completed" as const),
            };
          }
          return tp;
        });
        setTasks(finalProgress);
        setCurrentTaskIndex(finalProgress.length);

        // Save results
        const path = await saveResult(benchResult);
        setOutputPath(path);
        setResult(benchResult);
        setStatus("complete");

        // Exit after a short delay
        globalThis.setTimeout(() => exit(), 500);
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
        setStatus("error");
        globalThis.setTimeout(() => exit(), 100);
      }
    }

    run();
  }, [modelId, exit]);

  if (status === "error") {
    return (
      <Box flexDirection="column" padding={1}>
        <Text bold color="red">
          ✗ Benchmark Failed
        </Text>
        <Text color="red">{error}</Text>
      </Box>
    );
  }

  if (status === "loading") {
    return (
      <Box flexDirection="column" padding={1}>
        <Text bold color="cyan">
          🚀 MBSE Benchmark
        </Text>
        <Text dimColor>─────────────────────────</Text>
        <Box marginTop={1}>
          <Text>Loading tasks...</Text>
        </Box>
      </Box>
    );
  }

  if (status === "complete" && result) {
    return (
      <BenchmarkComplete
        modelId={modelId}
        version={version}
        tasks={tasks}
        duration={result.metadata.duration}
        outputPath={outputPath}
        timestamp={result.timestamp}
      />
    );
  }

  return (
    <Progress
      modelId={modelId}
      tasks={tasks}
      currentTaskIndex={currentTaskIndex}
      startTime={startTime}
      version={version}
    />
  );
}
