import React, { useState, useEffect } from "react";
import { Box, Text } from "ink";

interface TaskProgress {
  taskId: string;
  score: number;
  latencyMs: number;
  status: "pending" | "running" | "completed" | "failed";
}

interface ProgressProps {
  modelId: string;
  tasks: TaskProgress[];
  currentTaskIndex: number;
  startTime: number;
  version: string;
}

function formatTime(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  }
  return `${seconds}s`;
}

function formatScore(score: number): string {
  return `${(score * 100).toFixed(0)}%`;
}

function formatLatency(ms: number): string {
  return ms < 1000 ? `${ms}ms` : `${(ms / 1000).toFixed(1)}s`;
}

function ProgressBar({ current, total }: { current: number; total: number }) {
  const width = 20;
  const filled = total > 0 ? Math.round((current / total) * width) : 0;
  const empty = width - filled;
  const bar = "█".repeat(filled) + "░".repeat(empty);

  return (
    <Text>
      [{bar}] {current}/{total} tasks
    </Text>
  );
}

export function Progress({
  modelId,
  tasks,
  currentTaskIndex,
  startTime,
  version,
}: ProgressProps) {
  const [elapsed, setElapsed] = useState(() => Date.now() - startTime);

  useEffect(() => {
    const interval = globalThis.setInterval(() => {
      setElapsed(Date.now() - startTime);
    }, 1000);
    return () => globalThis.clearInterval(interval);
  }, [startTime]);

  const completedTasks = tasks.filter((t) => t.status === "completed").length;
  const currentTask = tasks[currentTaskIndex];

  return (
    <Box flexDirection="column" padding={1}>
      <Text bold color="cyan">
        🚀 MBSE Benchmark v{version}
      </Text>
      <Text dimColor>─────────────────────────────────────</Text>

      <Box marginTop={1}>
        <Text dimColor>Model: </Text>
        <Text bold>{modelId}</Text>
      </Box>
      <Box>
        <Text dimColor>Tasks: </Text>
        <Text>{tasks.length}</Text>
      </Box>

      <Box marginTop={1}>
        <ProgressBar current={completedTasks} total={tasks.length} />
      </Box>

      <Box marginTop={1}>
        <Text dimColor>Current: </Text>
        <Text color="yellow">{currentTask?.taskId ?? "—"}</Text>
      </Box>
      <Box>
        <Text dimColor>Elapsed: </Text>
        <Text>{formatTime(elapsed)}</Text>
      </Box>

      <Box marginTop={1} flexDirection="column">
        {tasks.map((task) => {
          const icon =
            task.status === "completed"
              ? "✓"
              : task.status === "failed"
                ? "✗"
                : task.status === "running"
                  ? "◐"
                  : "○";
          const color =
            task.status === "completed"
              ? "green"
              : task.status === "failed"
                ? "red"
                : task.status === "running"
                  ? "yellow"
                  : "gray";

          return (
            <Box key={task.taskId}>
              <Text color={color}>{icon}</Text>
              <Text> </Text>
              <Box width={24}>
                <Text color={task.status === "pending" ? "gray" : undefined}>
                  {task.taskId}
                </Text>
              </Box>
              <Box width={8}>
                {task.status === "completed" || task.status === "failed" ? (
                  <Text color={task.score > 0.5 ? "green" : "yellow"}>
                    {formatScore(task.score)}
                  </Text>
                ) : (
                  <Text dimColor>...</Text>
                )}
              </Box>
              <Box width={10}>
                {task.status === "completed" || task.status === "failed" ? (
                  <Text dimColor>{formatLatency(task.latencyMs)}</Text>
                ) : (
                  <Text dimColor>...</Text>
                )}
              </Box>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}

interface BenchmarkCompleteProps {
  modelId: string;
  version: string;
  tasks: TaskProgress[];
  duration: number;
  outputPath: string;
  timestamp: string;
}

export function BenchmarkComplete({
  modelId,
  version,
  tasks,
  duration,
  outputPath,
  timestamp,
}: BenchmarkCompleteProps) {
  const score =
    tasks.reduce((sum, t) => sum + t.score, 0) / Math.max(tasks.length, 1);
  const passedTasks = tasks.filter((t) => t.score > 0).length;

  const topTasks = [...tasks].sort((a, b) => b.score - a.score).slice(0, 3);

  return (
    <Box flexDirection="column" padding={1}>
      <Text bold color="green">
        🏁 Benchmark Complete
      </Text>
      <Text dimColor>─────────────────────────────────────</Text>

      <Box marginTop={1}>
        <Text dimColor>Model: </Text>
        <Text bold>{modelId}</Text>
      </Box>
      <Box>
        <Text dimColor>Version: </Text>
        <Text>{version}</Text>
      </Box>
      <Box>
        <Text dimColor>Executed: </Text>
        <Text>{timestamp}</Text>
      </Box>
      <Box>
        <Text dimColor>Score: </Text>
        <Text color={score > 0.5 ? "green" : "yellow"} bold>
          {formatScore(score)}
        </Text>
      </Box>
      <Box>
        <Text dimColor>Tasks: </Text>
        <Text>
          {passedTasks}/{tasks.length} passed
        </Text>
      </Box>
      <Box>
        <Text dimColor>Duration: </Text>
        <Text>{formatTime(duration)}</Text>
      </Box>

      {topTasks.length > 0 && (
        <Box marginTop={1} flexDirection="column">
          <Text bold>Top Scores:</Text>
          {topTasks.map((task) => (
            <Box key={task.taskId}>
              <Text>  </Text>
              <Box width={24}>
                <Text>{task.taskId}</Text>
              </Box>
              <Text color={task.score > 0.5 ? "green" : "yellow"}>
                {formatScore(task.score)}
              </Text>
            </Box>
          ))}
        </Box>
      )}

      <Box marginTop={1}>
        <Text dimColor>Saved: </Text>
        <Text color="cyan">{outputPath}</Text>
      </Box>
    </Box>
  );
}
