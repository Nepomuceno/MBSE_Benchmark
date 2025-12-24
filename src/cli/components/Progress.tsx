import React, { useState, useEffect } from "react";
import { Box, Text } from "ink";
import type { TaskProgressEvent, BenchmarkProgressEvent } from "../../benchmark/index.js";

export interface TaskProgress {
  taskId: string;
  score: number;
  latencyMs: number;
  status: "pending" | "running" | "completed" | "failed";
  iteration: number;
  maxIterations: number;
}

interface ProgressProps {
  modelId: string;
  tasks: TaskProgress[];
  currentTaskIndex: number;
  startTime: number;
  version: string;
  overallProgress?: BenchmarkProgressEvent["overall"];
}

// Spinner frames
const SPINNER = ["⣾", "⣽", "⣻", "⢿", "⡿", "⣟", "⣯", "⣷"];

function formatTime(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
  return `${seconds}s`;
}

function formatScore(score: number): string {
  return `${(score * 100).toFixed(0)}%`;
}

function formatLatency(ms: number): string {
  if (ms < 1000) return `${Math.round(ms)}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

function getScoreColor(score: number): string {
  if (score >= 0.8) return "green";
  if (score >= 0.5) return "yellow";
  if (score > 0) return "red";
  return "gray";
}

// Compact progress bar
function Bar({ value, max, width = 20, color = "cyan" }: { value: number; max: number; width?: number; color?: string }) {
  const pct = max > 0 ? value / max : 0;
  const filled = Math.round(pct * width);
  return (
    <Text>
      <Text color={color}>{"━".repeat(filled)}</Text>
      <Text color="gray">{"─".repeat(width - filled)}</Text>
    </Text>
  );
}

// Animated spinner
function Spin({ color = "cyan" }: { color?: string }) {
  const [frame, setFrame] = useState(0);
  useEffect(() => {
    const t = globalThis.setInterval(() => setFrame(f => (f + 1) % SPINNER.length), 80);
    return () => globalThis.clearInterval(t);
  }, []);
  return <Text color={color}>{SPINNER[frame]}</Text>;
}

export function Progress({
  modelId,
  tasks,
  currentTaskIndex: _currentTaskIndex,
  startTime,
  version,
  overallProgress,
}: ProgressProps) {
  const [elapsed, setElapsed] = useState(() => Date.now() - startTime);

  useEffect(() => {
    const t = globalThis.setInterval(() => setElapsed(Date.now() - startTime), 200);
    return () => globalThis.clearInterval(t);
  }, [startTime]);

  const completed = overallProgress?.completed ?? tasks.filter(t => t.status === "completed" || t.status === "failed").length;
  const running = overallProgress?.running ?? tasks.filter(t => t.status === "running").length;
  const total = overallProgress?.total ?? tasks.length;
  const runningScore = overallProgress?.runningScore ?? 0;
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

  // Get active tasks
  const activeTasks = tasks.filter(t => t.status === "running");
  const recentCompleted = tasks.filter(t => t.status === "completed" || t.status === "failed").slice(-3);

  return (
    <Box flexDirection="column" padding={1}>
      {/* Header */}
      <Box>
        <Text bold color="cyan">🚀 MBSE Benchmark</Text>
        <Text color="gray"> • </Text>
        <Text color="magenta">{modelId}</Text>
        <Text color="gray"> • v</Text>
        <Text>{version}</Text>
      </Box>

      {/* Main progress */}
      <Box marginTop={1}>
        <Bar value={completed} max={total} width={40} color="green" />
        <Text color="green" bold> {pct}%</Text>
        <Text color="gray"> ({completed}/{total})</Text>
        <Text color="gray"> • </Text>
        <Text color="yellow">{formatTime(elapsed)}</Text>
      </Box>

      {/* Stats row */}
      <Box marginTop={1}>
        <Text color="green">✓ {completed}</Text>
        <Text color="gray"> │ </Text>
        <Text color="yellow">◐ {running}</Text>
        <Text color="gray"> │ </Text>
        <Text color="gray">○ {total - completed - running}</Text>
        <Text color="gray"> │ </Text>
        <Text>Score: </Text>
        <Text color={getScoreColor(runningScore)} bold>
          {completed > 0 ? formatScore(runningScore) : "—"}
        </Text>
      </Box>

      {/* Active tasks */}
      {activeTasks.length > 0 && (
        <Box marginTop={1} flexDirection="column">
          <Text color="yellow" bold>▸ Running ({activeTasks.length})</Text>
          {activeTasks.slice(0, 5).map(task => (
            <Box key={task.taskId}>
              <Text>  </Text>
              <Spin color="yellow" />
              <Text color="yellow"> {task.taskId.slice(0, 32)}</Text>
              <Text color="gray"> [{task.iteration}/{task.maxIterations}]</Text>
            </Box>
          ))}
          {activeTasks.length > 5 && (
            <Text color="gray">  +{activeTasks.length - 5} more...</Text>
          )}
        </Box>
      )}

      {/* Recent completed */}
      {recentCompleted.length > 0 && (
        <Box marginTop={1} flexDirection="column">
          <Text color="gray">Recent:</Text>
          {recentCompleted.map(task => (
            <Box key={task.taskId}>
              <Text>  </Text>
              <Text color={task.score > 0.5 ? "green" : "red"}>
                {task.score > 0.5 ? "✓" : "✗"}
              </Text>
              <Text color="gray"> {task.taskId.slice(0, 28)}</Text>
              <Text color={getScoreColor(task.score)}> {formatScore(task.score)}</Text>
              <Text color="gray"> {formatLatency(task.latencyMs)}</Text>
            </Box>
          ))}
        </Box>
      )}
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
  const score = tasks.reduce((sum, t) => sum + t.score, 0) / Math.max(tasks.length, 1);
  const passed = tasks.filter(t => t.score >= 0.5).length;
  const perfect = tasks.filter(t => t.score === 1).length;
  
  // Grade based on score
  const grade = score >= 0.9 ? "A" : score >= 0.8 ? "B" : score >= 0.7 ? "C" : score >= 0.6 ? "D" : "F";
  const gradeColor = grade === "A" ? "green" : grade === "B" ? "cyan" : grade === "C" ? "yellow" : "red";

  // Sort for display
  const sorted = [...tasks].sort((a, b) => b.score - a.score);
  const top3 = sorted.slice(0, 3);
  const bottom3 = sorted.filter(t => t.score < 0.5).slice(-3);

  return (
    <Box flexDirection="column" padding={1}>
      {/* Header */}
      <Box>
        <Text bold color="green">✓ Benchmark Complete</Text>
        <Text color="gray"> • </Text>
        <Text color="magenta">{modelId}</Text>
        <Text color="gray"> • v</Text>
        <Text>{version}</Text>
      </Box>

      {/* Score display */}
      <Box marginTop={1} flexDirection="column">
        <Box>
          <Text>Score: </Text>
          <Text color={getScoreColor(score)} bold>{formatScore(score)}</Text>
          <Text> </Text>
          <Text color={gradeColor} bold>[{grade}]</Text>
          <Text color="gray"> • </Text>
          <Bar value={Math.round(score * 100)} max={100} width={20} color={getScoreColor(score)} />
        </Box>
      </Box>

      {/* Stats */}
      <Box marginTop={1}>
        <Text color="green">✓ {passed} passed</Text>
        <Text color="gray"> │ </Text>
        <Text color="red">✗ {tasks.length - passed} failed</Text>
        <Text color="gray"> │ </Text>
        <Text color="yellow">★ {perfect} perfect</Text>
        <Text color="gray"> │ </Text>
        <Text>⏱ {formatTime(duration)}</Text>
      </Box>

      {/* Top performers */}
      {top3.length > 0 && (
        <Box marginTop={1} flexDirection="column">
          <Text bold>🏆 Best</Text>
          {top3.map((task, i) => (
            <Box key={task.taskId}>
              <Text color={i === 0 ? "yellow" : "gray"}>
                {i === 0 ? "  🥇" : i === 1 ? "  🥈" : "  🥉"}
              </Text>
              <Text> {task.taskId.slice(0, 28).padEnd(28)}</Text>
              <Text color={getScoreColor(task.score)}> {formatScore(task.score)}</Text>
            </Box>
          ))}
        </Box>
      )}

      {/* Needs work */}
      {bottom3.length > 0 && (
        <Box marginTop={1} flexDirection="column">
          <Text bold>📉 Needs Work</Text>
          {bottom3.map(task => (
            <Box key={task.taskId}>
              <Text color="red">  •</Text>
              <Text> {task.taskId.slice(0, 28).padEnd(28)}</Text>
              <Text color={getScoreColor(task.score)}> {formatScore(task.score)}</Text>
            </Box>
          ))}
        </Box>
      )}

      {/* Footer */}
      <Box marginTop={1} flexDirection="column">
        <Text color="gray">────────────────────────────────────────────────</Text>
        <Box>
          <Text color="gray">Saved: </Text>
          <Text color="cyan">{outputPath}</Text>
        </Box>
        <Box>
          <Text color="gray">Time: </Text>
          <Text>{new Date(timestamp).toLocaleString()}</Text>
        </Box>
      </Box>
    </Box>
  );
}

// Cached result display
interface CachedResultProps {
  modelId: string;
  version: string;
  tasks: TaskProgress[];
  duration: number;
  outputPath: string;
  timestamp: string;
  score: number;
}

export function CachedResult({
  modelId,
  version,
  tasks,
  duration,
  outputPath,
  timestamp,
  score,
}: CachedResultProps) {
  const passed = tasks.filter(t => t.score >= 0.5).length;
  const grade = score >= 0.9 ? "A" : score >= 0.8 ? "B" : score >= 0.7 ? "C" : score >= 0.6 ? "D" : "F";
  const gradeColor = grade === "A" ? "green" : grade === "B" ? "cyan" : grade === "C" ? "yellow" : "red";

  return (
    <Box flexDirection="column" padding={1}>
      {/* Header */}
      <Box>
        <Text bold color="blue">📦 Cached Result</Text>
        <Text color="gray"> • </Text>
        <Text color="magenta">{modelId}</Text>
        <Text color="gray"> • v</Text>
        <Text>{version}</Text>
      </Box>

      {/* Score */}
      <Box marginTop={1}>
        <Text>Score: </Text>
        <Text color={getScoreColor(score)} bold>{formatScore(score)}</Text>
        <Text> </Text>
        <Text color={gradeColor} bold>[{grade}]</Text>
        <Text color="gray"> │ </Text>
        <Text color="green">✓ {passed}</Text>
        <Text color="gray">/</Text>
        <Text>{tasks.length}</Text>
        <Text color="gray"> │ </Text>
        <Text>⏱ {formatTime(duration)}</Text>
      </Box>

      {/* Info */}
      <Box marginTop={1} flexDirection="column">
        <Box>
          <Text color="gray">From: </Text>
          <Text color="cyan">{outputPath}</Text>
        </Box>
        <Box>
          <Text color="gray">Run: </Text>
          <Text>{new Date(timestamp).toLocaleString()}</Text>
        </Box>
        <Box marginTop={1}>
          <Text color="yellow">💡 Use --force to re-run benchmark</Text>
        </Box>
      </Box>
    </Box>
  );
}

// Export types
export type { TaskProgressEvent, BenchmarkProgressEvent };
