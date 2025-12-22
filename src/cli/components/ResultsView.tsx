import React from "react";
import { Box, Text } from "ink";
import { readdirSync, readFileSync, existsSync } from "fs";
import { join } from "path";

interface ResultsViewProps {
  modelId?: string;
}

interface TaskResult {
  taskId: string;
  score: number;
  latencyMs: number;
}

interface ModelResult {
  version: string;
  modelId: string;
  timestamp: string;
  tasks: TaskResult[];
  score: number;
  metadata?: {
    duration: number;
    tasksCompleted: number;
    tasksFailed: number;
    totalIterations: number;
  };
}

function loadAllResults(): ModelResult[] {
  const resultsDir = join(process.cwd(), "data/results");
  const results: ModelResult[] = [];

  if (!existsSync(resultsDir)) return results;

  const versions = readdirSync(resultsDir);
  for (const version of versions) {
    if (version === "README.md") continue;

    const versionPath = join(resultsDir, version);
    try {
      const files = readdirSync(versionPath);
      for (const file of files) {
        if (!file.endsWith(".json")) continue;
        const content = readFileSync(join(versionPath, file), "utf-8");
        results.push(JSON.parse(content) as ModelResult);
      }
    } catch {
      // Skip invalid directories
    }
  }

  return results.sort((a, b) => b.score - a.score);
}

function formatScore(score: number): string {
  return `${(score * 100).toFixed(1)}%`;
}

function formatLatency(ms: number): string {
  return ms < 1000 ? `${ms}ms` : `${(ms / 1000).toFixed(1)}s`;
}

function getRankEmoji(rank: number): string {
  if (rank === 1) return "🥇";
  if (rank === 2) return "🥈";
  if (rank === 3) return "🥉";
  return `${rank}.`;
}

function getLatestVersion(results: ModelResult[]): string | null {
  const versions = [...new Set(results.map((r) => r.version))].sort((a, b) => {
    const aParts = a.split(".").map(Number);
    const bParts = b.split(".").map(Number);
    const aMajor = aParts[0] ?? 0;
    const aMinor = aParts[1] ?? 0;
    const aPatch = aParts[2] ?? 0;
    const bMajor = bParts[0] ?? 0;
    const bMinor = bParts[1] ?? 0;
    const bPatch = bParts[2] ?? 0;
    if (aMajor !== bMajor) return bMajor - aMajor;
    if (aMinor !== bMinor) return bMinor - aMinor;
    return bPatch - aPatch;
  });
  return versions[0] ?? null;
}

function getResultsForVersion(
  results: ModelResult[],
  version: string
): ModelResult[] {
  const versionResults = results.filter((r) => r.version === version);

  // Deduplicate by modelId, keeping best score
  const bestByModel = new Map<string, ModelResult>();
  for (const result of versionResults) {
    const existing = bestByModel.get(result.modelId);
    if (!existing || result.score > existing.score) {
      bestByModel.set(result.modelId, result);
    }
  }

  return Array.from(bestByModel.values()).sort((a, b) => b.score - a.score);
}

export function ResultsView({ modelId }: ResultsViewProps) {
  // Load results synchronously on render (fine for CLI)
  const allResults = loadAllResults();
  const latestVersion = getLatestVersion(allResults);
  const results = latestVersion
    ? getResultsForVersion(allResults, latestVersion)
    : [];

  return (
    <Box flexDirection="column" padding={1}>
      <Text bold color="cyan">
        📊 Benchmark Results
      </Text>
      <Text dimColor>─────────────────────────────────────</Text>

      {modelId ? (
        <ModelResults results={results} modelId={modelId} latestVersion={latestVersion} />
      ) : (
        <LeaderboardResults results={results} latestVersion={latestVersion} />
      )}
    </Box>
  );
}

function LeaderboardResults({
  results,
  latestVersion,
}: {
  results: ModelResult[];
  latestVersion: string | null;
}) {
  if (results.length === 0) {
    return (
      <Box flexDirection="column" marginTop={1}>
        <Text bold>Leaderboard</Text>
        <Text dimColor>(No results yet - run a benchmark first)</Text>
      </Box>
    );
  }

  // Results are already filtered and deduplicated by version
  const ranked = results;

  return (
    <Box flexDirection="column" marginTop={1}>
      <Text bold>Leaderboard (v{latestVersion})</Text>
      <Box marginTop={1} />

      {/* Header */}
      <Box>
        <Box width={6}>
          <Text bold dimColor>
            Rank
          </Text>
        </Box>
        <Box width={16}>
          <Text bold dimColor>
            Model
          </Text>
        </Box>
        <Box width={10}>
          <Text bold dimColor>
            Score
          </Text>
        </Box>
        <Box width={10}>
          <Text bold dimColor>
            Tasks
          </Text>
        </Box>
        <Box width={12}>
          <Text bold dimColor>
            Latency
          </Text>
        </Box>
      </Box>

      <Text dimColor>────  ──────────────  ────────  ────────  ──────────</Text>

      {ranked.map((result, index) => {
        const avgLatency =
          result.tasks.reduce((sum, t) => sum + t.latencyMs, 0) /
          result.tasks.length;
        const passedTasks = result.tasks.filter((t) => t.score > 0).length;

        return (
          <Box key={result.modelId}>
            <Box width={6}>
              <Text>{getRankEmoji(index + 1)}</Text>
            </Box>
            <Box width={16}>
              <Text>{result.modelId}</Text>
            </Box>
            <Box width={10}>
              <Text color={result.score > 0.5 ? "green" : "yellow"}>
                {formatScore(result.score)}
              </Text>
            </Box>
            <Box width={10}>
              <Text>
                {passedTasks}/{result.tasks.length}
              </Text>
            </Box>
            <Box width={12}>
              <Text dimColor>{formatLatency(avgLatency)} avg</Text>
            </Box>
          </Box>
        );
      })}

      <Box marginTop={1}>
        <Text dimColor>
          {results.length} model(s) in version {latestVersion}
        </Text>
      </Box>
    </Box>
  );
}

function ModelResults({
  results,
  modelId,
  latestVersion,
}: {
  results: ModelResult[];
  modelId: string;
  latestVersion: string | null;
}) {
  const modelResult = results.find((r) => r.modelId === modelId);

  if (!modelResult) {
    return (
      <Box flexDirection="column" marginTop={1}>
        <Text bold>Model: {modelId}</Text>
        <Text dimColor>(No results found for this model in version {latestVersion})</Text>
      </Box>
    );
  }

  const passedTasks = modelResult.tasks.filter((t) => t.score > 0).length;

  return (
    <Box flexDirection="column" marginTop={1}>
      <Text bold>Model Results: {modelId}</Text>
      <Box marginTop={1} />

      <Box>
        <Text dimColor>Version: </Text>
        <Text>{modelResult.version}</Text>
      </Box>
      <Box>
        <Text dimColor>Score:   </Text>
        <Text color={modelResult.score > 0.5 ? "green" : "yellow"}>
          {formatScore(modelResult.score)}
        </Text>
      </Box>
      <Box>
        <Text dimColor>Tasks:   </Text>
        <Text>
          {passedTasks}/{modelResult.tasks.length} passed
        </Text>
      </Box>
      <Box>
        <Text dimColor>Date:    </Text>
        <Text>{new Date(modelResult.timestamp).toLocaleDateString()}</Text>
      </Box>

      <Box marginTop={1}>
        <Text bold>Task Scores:</Text>
      </Box>

      {modelResult.tasks.map((task) => (
        <Box key={task.taskId}>
          <Text color={task.score > 0 ? "green" : "red"}>
            {task.score > 0 ? "✓" : "✗"}
          </Text>
          <Text> </Text>
          <Box width={24}>
            <Text>{task.taskId}</Text>
          </Box>
          <Box width={8}>
            <Text color={task.score > 0.5 ? "green" : "yellow"}>
              {formatScore(task.score)}
            </Text>
          </Box>
          <Text dimColor>{formatLatency(task.latencyMs)}</Text>
        </Box>
      ))}
    </Box>
  );
}
