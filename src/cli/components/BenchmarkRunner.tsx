import React, { useState, useEffect } from "react";
import { Box, Text, useApp } from "ink";
import { runBenchmark, computeVersion } from "../../benchmark/index.js";
import type { BenchmarkResult, BenchmarkProgressEvent } from "../../benchmark/index.js";
import { loadAllTasks } from "../../tasks/index.js";
import { saveResult } from "../../reports/index.js";
import { getCachedResult } from "../../cache/index.js";
import { Progress, BenchmarkComplete, CachedResult } from "./Progress.js";
import type { TaskProgress } from "./Progress.js";
import { loadBenchmarkSettings } from "../../evaluation/index.js";

interface BenchmarkRunnerProps {
  modelId: string;
  force?: boolean;
  verbose?: boolean;
}

export function BenchmarkRunner({ modelId, force, verbose: _verbose }: BenchmarkRunnerProps) {
  const { exit } = useApp();
  const [status, setStatus] = useState<"loading" | "checking_cache" | "cached" | "running" | "complete" | "error">("loading");
  const [tasks, setTasks] = useState<TaskProgress[]>([]);
  const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
  const [startTime] = useState(() => Date.now());
  const [version, setVersion] = useState("");
  const [result, setResult] = useState<BenchmarkResult | null>(null);
  const [outputPath, setOutputPath] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [overallProgress, setOverallProgress] = useState<BenchmarkProgressEvent["overall"] | undefined>();

  useEffect(() => {
    async function run() {
      try {
        // Load version
        const ver = await computeVersion(".");
        setVersion(ver);
        setStatus("checking_cache");

        // Check cache unless force is set
        if (!force) {
          const cached = await getCachedResult(ver, modelId);
          if (cached) {
            // Build task progress from cached result
            const cachedTasks: TaskProgress[] = cached.tasks.map((t) => ({
              taskId: t.taskId,
              score: t.score,
              latencyMs: t.latencyMs,
              status: t.error ? ("failed" as const) : ("completed" as const),
              iteration: t.iterations.length,
              maxIterations: t.iterations.length,
            }));
            setTasks(cachedTasks);
            setResult(cached);
            setOutputPath(`./data/results/${ver}/${modelId}.json`);
            setStatus("cached");
            globalThis.setTimeout(() => exit(), 500);
            return;
          }
        }

        const settings = loadBenchmarkSettings();
        const maxIterations = settings.maxIterations;

        const loadedTasks = await loadAllTasks(".");
        const taskProgress: TaskProgress[] = loadedTasks.map((t) => ({
          taskId: t.id,
          score: 0,
          latencyMs: 0,
          status: "pending" as const,
          iteration: 0,
          maxIterations,
        }));
        setTasks(taskProgress);
        setStatus("running");

        // Progress callback for live updates
        const onProgress = (event: BenchmarkProgressEvent) => {
          setOverallProgress(event.overall);
          
          setTasks((prevTasks) => {
            const updated = [...prevTasks];
            const taskIndex = updated.findIndex(t => t.taskId === event.task.taskId);
            if (taskIndex >= 0) {
              const existing = updated[taskIndex]!;
              updated[taskIndex] = {
                taskId: existing.taskId,
                maxIterations: existing.maxIterations,
                status: event.task.status,
                score: event.task.score ?? existing.score,
                latencyMs: event.task.latencyMs ?? existing.latencyMs,
                iteration: event.task.iteration,
              };
            }
            return updated;
          });

          // Update current task index for running tasks
          if (event.task.status === "running") {
            const idx = taskProgress.findIndex(t => t.taskId === event.task.taskId);
            if (idx >= 0) setCurrentTaskIndex(idx);
          }
        };

        // Run benchmark with progress callback
        const benchResult = await runBenchmark(modelId, {
          version: ver,
          basePath: ".",
          onProgress,
        });

        // Update task progress with final results
        const finalProgress = taskProgress.map((tp) => {
          const taskResult = benchResult.tasks.find((t) => t.taskId === tp.taskId);
          if (taskResult) {
            return {
              ...tp,
              score: taskResult.score,
              latencyMs: taskResult.latencyMs,
              status: taskResult.error ? ("failed" as const) : ("completed" as const),
              iteration: taskResult.iterations.length,
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
  }, [modelId, force, exit]);

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

  if (status === "loading" || status === "checking_cache") {
    return (
      <Box flexDirection="column" padding={1}>
        <Text bold color="cyan">
          🚀 MBSE Benchmark
        </Text>
        <Text color="cyan">━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━</Text>
        <Box marginTop={1}>
          <Text color="yellow">
            {status === "loading" ? "⏳ Loading tasks..." : "🔍 Checking cache..."}
          </Text>
        </Box>
      </Box>
    );
  }

  if (status === "cached" && result) {
    return (
      <CachedResult
        modelId={modelId}
        version={version}
        tasks={tasks}
        duration={result.metadata.duration}
        outputPath={outputPath}
        timestamp={result.timestamp}
        score={result.score}
      />
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
      overallProgress={overallProgress}
    />
  );
}
