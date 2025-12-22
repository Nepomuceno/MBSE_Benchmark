import { readdirSync, readFileSync, existsSync, writeFileSync } from "fs";
import { join } from "path";

interface TaskResult {
  taskId: string;
  score: number;
  latencyMs: number;
  finalResponse?: string;
  iterations?: unknown[];
  evaluation?: {
    score: number;
    details: {
      matched: string[];
      missing: string[];
    };
    explanation: string;
  };
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

interface ExportOptions {
  version?: string;
  modelId?: string;
  includeResponses?: boolean;
  includeIterations?: boolean;
  pretty?: boolean;
}

interface ExportedData {
  exportedAt: string;
  version?: string;
  results: ModelResult[];
  summary: {
    totalModels: number;
    totalTasks: number;
    averageScore: number;
    versions: string[];
  };
}

function loadResults(resultsDir: string): ModelResult[] {
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

  return results;
}

export function exportToJson(
  resultsDir: string,
  options: ExportOptions = {}
): ExportedData {
  let results = loadResults(resultsDir);

  // Filter by version if specified
  if (options.version) {
    results = results.filter((r) => r.version === options.version);
  }

  // Filter by model if specified
  if (options.modelId) {
    results = results.filter((r) => r.modelId === options.modelId);
  }

  // Remove responses if not requested
  if (!options.includeResponses) {
    results = results.map((r) => ({
      ...r,
      tasks: r.tasks.map((t) => {
        const { finalResponse: _, ...rest } = t;
        return rest;
      }),
    }));
  }

  // Remove iterations if not requested
  if (!options.includeIterations) {
    results = results.map((r) => ({
      ...r,
      tasks: r.tasks.map((t) => {
        const { iterations: _, ...rest } = t;
        return rest;
      }),
    }));
  }

  // Calculate summary
  const versions = [...new Set(results.map((r) => r.version))];
  const totalTasks = results.reduce((sum, r) => sum + r.tasks.length, 0);
  const averageScore =
    results.length > 0
      ? results.reduce((sum, r) => sum + r.score, 0) / results.length
      : 0;

  return {
    exportedAt: new Date().toISOString(),
    version: options.version,
    results,
    summary: {
      totalModels: results.length,
      totalTasks,
      averageScore,
      versions,
    },
  };
}

export function exportToJsonFile(
  resultsDir: string,
  outputPath: string,
  options: ExportOptions = {}
): void {
  const data = exportToJson(resultsDir, options);
  const json = options.pretty
    ? JSON.stringify(data, null, 2)
    : JSON.stringify(data);
  writeFileSync(outputPath, json, "utf-8");
}

export function exportToJsonString(
  resultsDir: string,
  options: ExportOptions = {}
): string {
  const data = exportToJson(resultsDir, options);
  return options.pretty ? JSON.stringify(data, null, 2) : JSON.stringify(data);
}
