import { readdirSync, readFileSync, existsSync, writeFileSync } from "fs";
import { join } from "path";

interface TaskResult {
  taskId: string;
  score: number;
  latencyMs: number;
  finalResponse?: string;
  evaluation?: {
    score: number;
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

interface CsvExportOptions {
  version?: string;
  modelId?: string;
  delimiter?: string;
  includeHeader?: boolean;
}

interface CsvRow {
  version: string;
  modelId: string;
  timestamp: string;
  overallScore: number;
  taskId: string;
  taskScore: number;
  taskLatencyMs: number;
  duration?: number;
  tasksCompleted?: number;
  tasksFailed?: number;
  totalIterations?: number;
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

function escapeCSV(value: string | number | undefined, delimiter: string): string {
  if (value === undefined || value === null) return "";
  const str = String(value);
  // Escape quotes and wrap in quotes if contains delimiter, quotes, or newlines
  if (str.includes(delimiter) || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function exportToCsv(
  resultsDir: string,
  options: CsvExportOptions = {}
): string {
  const delimiter = options.delimiter ?? ",";
  const includeHeader = options.includeHeader ?? true;

  let results = loadResults(resultsDir);

  // Filter by version if specified
  if (options.version) {
    results = results.filter((r) => r.version === options.version);
  }

  // Filter by model if specified
  if (options.modelId) {
    results = results.filter((r) => r.modelId === options.modelId);
  }

  // Flatten results to rows (one row per task)
  const rows: CsvRow[] = [];
  for (const result of results) {
    for (const task of result.tasks) {
      rows.push({
        version: result.version,
        modelId: result.modelId,
        timestamp: result.timestamp,
        overallScore: result.score,
        taskId: task.taskId,
        taskScore: task.score,
        taskLatencyMs: task.latencyMs,
        duration: result.metadata?.duration,
        tasksCompleted: result.metadata?.tasksCompleted,
        tasksFailed: result.metadata?.tasksFailed,
        totalIterations: result.metadata?.totalIterations,
      });
    }
  }

  // Build CSV
  const headers = [
    "version",
    "modelId",
    "timestamp",
    "overallScore",
    "taskId",
    "taskScore",
    "taskLatencyMs",
    "duration",
    "tasksCompleted",
    "tasksFailed",
    "totalIterations",
  ];

  const lines: string[] = [];

  if (includeHeader) {
    lines.push(headers.join(delimiter));
  }

  for (const row of rows) {
    const values = headers.map((h) =>
      escapeCSV(row[h as keyof CsvRow], delimiter)
    );
    lines.push(values.join(delimiter));
  }

  return lines.join("\n");
}

export function exportToCsvFile(
  resultsDir: string,
  outputPath: string,
  options: CsvExportOptions = {}
): void {
  const csv = exportToCsv(resultsDir, options);
  writeFileSync(outputPath, csv, "utf-8");
}

// Summary CSV: one row per model (aggregated)
export function exportSummaryToCsv(
  resultsDir: string,
  options: CsvExportOptions = {}
): string {
  const delimiter = options.delimiter ?? ",";
  const includeHeader = options.includeHeader ?? true;

  let results = loadResults(resultsDir);

  if (options.version) {
    results = results.filter((r) => r.version === options.version);
  }

  if (options.modelId) {
    results = results.filter((r) => r.modelId === options.modelId);
  }

  // Sort by score descending
  results.sort((a, b) => b.score - a.score);

  const headers = [
    "rank",
    "version",
    "modelId",
    "score",
    "tasksCount",
    "avgLatencyMs",
    "duration",
    "timestamp",
  ];

  const lines: string[] = [];

  if (includeHeader) {
    lines.push(headers.join(delimiter));
  }

  results.forEach((result, index) => {
    const avgLatency =
      result.tasks.length > 0
        ? Math.round(
            result.tasks.reduce((sum, t) => sum + t.latencyMs, 0) /
              result.tasks.length
          )
        : 0;

    const values = [
      index + 1,
      escapeCSV(result.version, delimiter),
      escapeCSV(result.modelId, delimiter),
      (result.score * 100).toFixed(1),
      result.tasks.length,
      avgLatency,
      result.metadata?.duration ?? "",
      escapeCSV(result.timestamp, delimiter),
    ];

    lines.push(values.join(delimiter));
  });

  return lines.join("\n");
}

export function exportSummaryToCsvFile(
  resultsDir: string,
  outputPath: string,
  options: CsvExportOptions = {}
): void {
  const csv = exportSummaryToCsv(resultsDir, options);
  writeFileSync(outputPath, csv, "utf-8");
}
