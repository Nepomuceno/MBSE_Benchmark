import React, { useState, useEffect } from "react";
import { Box, Text, useApp } from "ink";
import { runBenchmark, computeVersion } from "../../benchmark/index.js";
import type { BenchmarkResult, BenchmarkProgressEvent } from "../../benchmark/index.js";
import { saveResult } from "../../reports/index.js";
import { getCachedResult } from "../../cache/index.js";
import { loadModels } from "../../models/index.js";
import type { ModelConfig } from "../../models/index.js";

interface AllModelsRunnerProps {
  force?: boolean;
}

interface ModelRun {
  model: ModelConfig;
  status: "pending" | "running" | "cached" | "complete" | "error";
  score?: number;
  duration?: number;
  error?: string;
  // Task-level progress
  tasksCompleted?: number;
  tasksTotal?: number;
  tasksRunning?: number;
  currentTask?: string;
}

// Spinner frames
const SPINNER = ["⣾", "⣽", "⣻", "⢿", "⡿", "⣟", "⣯", "⣷"];

function Spin({ color = "cyan" }: { color?: string }) {
  const [frame, setFrame] = useState(0);
  useEffect(() => {
    const t = globalThis.setInterval(() => setFrame(f => (f + 1) % SPINNER.length), 80);
    return () => globalThis.clearInterval(t);
  }, []);
  return <Text color={color}>{SPINNER[frame]}</Text>;
}

function formatTime(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
  return `${seconds}s`;
}

function formatScore(score: number): string {
  return `${(score * 100).toFixed(0)}%`;
}

function getScoreColor(score: number): string {
  if (score >= 0.8) return "green";
  if (score >= 0.5) return "yellow";
  if (score > 0) return "red";
  return "gray";
}

export function AllModelsRunner({ force }: AllModelsRunnerProps) {
  const { exit } = useApp();
  const [version, setVersion] = useState("");
  const [modelRuns, setModelRuns] = useState<ModelRun[]>([]);
  const [elapsed, setElapsed] = useState(0);
  const [startTime] = useState(() => Date.now());
  const [status, setStatus] = useState<"loading" | "running" | "complete">("loading");

  useEffect(() => {
    const t = globalThis.setInterval(() => setElapsed(Date.now() - startTime), 200);
    return () => globalThis.clearInterval(t);
  }, [startTime]);

  useEffect(() => {
    async function runAll() {
      const ver = await computeVersion(".");
      setVersion(ver);

      const models = loadModels();
      const runs: ModelRun[] = models.map(m => ({ model: m, status: "pending" as const }));
      setModelRuns(runs);
      setStatus("running");

      for (let i = 0; i < runs.length; i++) {
        const run = runs[i]!;

        // Update status to running
        setModelRuns(prev => prev.map((r, idx) => 
          idx === i ? { ...r, status: "running" as const } : r
        ));

        try {
          // Check cache first
          if (!force) {
            const cached = await getCachedResult(ver, run.model.id);
            if (cached) {
              setModelRuns(prev => prev.map((r, idx) => 
                idx === i ? { 
                  ...r, 
                  status: "cached" as const, 
                  score: cached.score,
                  duration: cached.metadata.duration 
                } : r
              ));
              continue;
            }
          }

          // Run benchmark with progress callback
          const result: BenchmarkResult = await runBenchmark(run.model.id, {
            version: ver,
            basePath: ".",
            onProgress: (event: BenchmarkProgressEvent) => {
              setModelRuns(prev => prev.map((r, idx) => 
                idx === i ? { 
                  ...r, 
                  tasksCompleted: event.overall.completed,
                  tasksTotal: event.overall.total,
                  tasksRunning: event.overall.running,
                  currentTask: event.task.taskId,
                  score: event.overall.runningScore,
                } : r
              ));
            },
          });

          await saveResult(result);

          setModelRuns(prev => prev.map((r, idx) => 
            idx === i ? { 
              ...r, 
              status: "complete" as const, 
              score: result.score,
              duration: result.metadata.duration,
              tasksCompleted: result.tasks.length,
              tasksTotal: result.tasks.length,
              tasksRunning: 0,
            } : r
          ));
        } catch (err) {
          setModelRuns(prev => prev.map((r, idx) => 
            idx === i ? { 
              ...r, 
              status: "error" as const, 
              error: err instanceof Error ? err.message : String(err)
            } : r
          ));
        }
      }

      setStatus("complete");
      globalThis.setTimeout(() => exit(), 500);
    }

    runAll();
  }, [force, exit]);

  const completed = modelRuns.filter(r => r.status === "complete" || r.status === "cached" || r.status === "error").length;
  const total = modelRuns.length;
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

  if (status === "loading") {
    return (
      <Box flexDirection="column" padding={1}>
        <Text bold color="cyan">🚀 MBSE Benchmark - All Models</Text>
        <Text color="cyan">━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━</Text>
        <Box marginTop={1}>
          <Text color="yellow">⏳ Loading models...</Text>
        </Box>
      </Box>
    );
  }

  return (
    <Box flexDirection="column" padding={1}>
      <Box>
        <Text bold color="cyan">🚀 MBSE Benchmark - All Models</Text>
        <Text color="gray"> • v</Text>
        <Text>{version}</Text>
      </Box>
      <Text color="cyan">━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━</Text>

      {/* Progress */}
      <Box marginTop={1}>
        <Text color="green">{"━".repeat(Math.round(pct / 100 * 30))}</Text>
        <Text color="gray">{"─".repeat(30 - Math.round(pct / 100 * 30))}</Text>
        <Text color="green" bold> {pct}%</Text>
        <Text color="gray"> ({completed}/{total} models)</Text>
        <Text color="gray"> • </Text>
        <Text color="yellow">{formatTime(elapsed)}</Text>
      </Box>

      {/* Models list */}
      <Box marginTop={1} flexDirection="column">
        <Box>
          <Box width={22}><Text bold color="gray">Model</Text></Box>
          <Box width={18}><Text bold color="gray">Progress</Text></Box>
          <Box width={10}><Text bold color="gray">Score</Text></Box>
          <Box width={10}><Text bold color="gray">Time</Text></Box>
        </Box>
        <Text color="gray">────────────────────────────────────────────────────────</Text>

        {modelRuns.map((run) => (
          <Box key={run.model.id} flexDirection="column">
            <Box>
              <Box width={22}>
                <Text color={run.status === "running" ? "yellow" : "white"}>
                  {run.model.id}
                </Text>
              </Box>
              <Box width={18}>
                {run.status === "pending" && <Text color="gray">○ Pending</Text>}
                {run.status === "running" && (
                  <Box>
                    <Spin color="yellow" />
                    <Text color="yellow"> {run.tasksCompleted ?? 0}/{run.tasksTotal ?? "?"}</Text>
                    {run.tasksRunning !== undefined && run.tasksRunning > 0 && (
                      <Text color="gray"> ({run.tasksRunning} active)</Text>
                    )}
                  </Box>
                )}
                {run.status === "cached" && <Text color="blue">📦 Cached</Text>}
                {run.status === "complete" && <Text color="green">✓ {run.tasksCompleted}/{run.tasksTotal}</Text>}
                {run.status === "error" && <Text color="red">✗ Error</Text>}
              </Box>
              <Box width={10}>
                {run.score !== undefined ? (
                  <Text color={getScoreColor(run.score)}>{formatScore(run.score)}</Text>
                ) : run.status === "error" ? (
                  <Text color="red">—</Text>
                ) : (
                  <Text color="gray">—</Text>
                )}
              </Box>
              <Box width={10}>
                {run.duration !== undefined ? (
                  <Text color="gray">{formatTime(run.duration)}</Text>
                ) : (
                  <Text color="gray">—</Text>
                )}
              </Box>
            </Box>
            {/* Show current task for running model */}
            {run.status === "running" && run.currentTask && (
              <Box marginLeft={2}>
                <Text color="gray">  └─ </Text>
                <Text color="yellow">{run.currentTask}</Text>
              </Box>
            )}
          </Box>
        ))}
      </Box>

      {/* Summary when complete */}
      {status === "complete" && (
        <Box marginTop={1} flexDirection="column">
          <Text color="gray">────────────────────────────────────────────────────────</Text>
          <Box>
            <Text color="green">✓ All models complete</Text>
            <Text color="gray"> • </Text>
            <Text>Total time: </Text>
            <Text color="cyan">{formatTime(elapsed)}</Text>
          </Box>
          {(() => {
            const scores = modelRuns.filter(r => r.score !== undefined).map(r => r.score!);
            if (scores.length === 0) return null;
            const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
            const best = modelRuns.reduce((a, b) => 
              (b.score ?? 0) > (a.score ?? 0) ? b : a
            );
            return (
              <>
                <Box>
                  <Text>Average score: </Text>
                  <Text color={getScoreColor(avg)} bold>{formatScore(avg)}</Text>
                </Box>
                {best.score !== undefined && (
                  <Box>
                    <Text>Best model: </Text>
                    <Text color="magenta" bold>{best.model.id}</Text>
                    <Text> </Text>
                    <Text color={getScoreColor(best.score)}>{formatScore(best.score)}</Text>
                  </Box>
                )}
              </>
            );
          })()}
        </Box>
      )}
    </Box>
  );
}
