import React from "react";
import { Box, Text } from "ink";

interface ResultsViewProps {
  modelId?: string;
}

export function ResultsView({ modelId }: ResultsViewProps) {
  // TODO: Load results from data/results/
  return (
    <Box flexDirection="column" padding={1}>
      <Text bold color="cyan">
        📊 Benchmark Results
      </Text>
      <Text dimColor>─────────────────────────</Text>

      {modelId ? (
        <ModelResults modelId={modelId} />
      ) : (
        <LeaderboardResults />
      )}
    </Box>
  );
}

function LeaderboardResults() {
  // TODO: Load all results and display leaderboard
  return (
    <Box flexDirection="column" marginTop={1}>
      <Text bold>Leaderboard</Text>
      <Text dimColor>(No results yet - run a benchmark first)</Text>
    </Box>
  );
}

function ModelResults({ modelId }: { modelId: string }) {
  // TODO: Load specific model results
  return (
    <Box flexDirection="column" marginTop={1}>
      <Text bold>Model: {modelId}</Text>
      <Text dimColor>(No results found for this model)</Text>
    </Box>
  );
}
