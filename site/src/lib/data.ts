import { readdir, stat, readFile } from 'fs/promises';
import { join } from 'path';

export interface ToolCall {
  id: string;
  name: string;
  arguments: Record<string, unknown>;
}

export interface ToolResult {
  tool: string;
  result: unknown;
}

export interface TaskIteration {
  iteration: number;
  response: string;
  toolCalls?: ToolCall[];
  toolResults?: ToolResult[];
  latencyMs: number;
}

export interface TaskResult {
  taskId: string;
  score: number;
  finalResponse?: string;
  latencyMs: number;
  iterations?: TaskIteration[];
  evaluation?: {
    score: number;
    details: {
      matched: string[];
      missing: string[];
    };
    explanation: string;
  };
}

export interface ModelResult {
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

export interface TaskDefinition {
  id: string;
  name: string;
  description: string;
  prompt: string;
  type: string;
  maxTokens?: number;
  files?: {
    initial?: string;
    expected?: unknown[];
  };
  evaluation: {
    type: string;
    weight: number;
  };
}

// Use process.cwd() which should be the site directory during build
// Then go up one level to the project root
function getDataDir(): string {
  // Check if we're in the site directory or project root
  const cwd = process.cwd();
  if (cwd.endsWith('/site')) {
    return join(cwd, '../data');
  }
  return join(cwd, 'data');
}

const RESULTS_DIR = join(getDataDir(), 'results');
const TASKS_DIR = join(getDataDir(), 'tasks');

export async function loadAllResults(): Promise<ModelResult[]> {
  const results: ModelResult[] = [];

  try {
    const versions = await readdir(RESULTS_DIR);

    for (const version of versions) {
      if (version === 'README.md') continue;

      const versionPath = join(RESULTS_DIR, version);
      const files = await readdir(versionPath);

      for (const file of files) {
        if (!file.endsWith('.json')) continue;

        const content = await readFile(join(versionPath, file), 'utf-8');
        results.push(JSON.parse(content) as ModelResult);
      }
    }
  } catch {
    // No results yet
  }

  return results.sort((a, b) => b.score - a.score);
}

export async function getLatestVersion(): Promise<string | null> {
  try {
    const versions = await readdir(RESULTS_DIR);
    const validVersions = versions
      .filter((v) => v !== 'README.md')
      .sort((a, b) => {
        // Sort lexicographically - works with 0.1.0-YYYYMMDDHHMM format
        return b.localeCompare(a);
      });
    return validVersions[0] ?? null;
  } catch {
    return null;
  }
}

export async function loadResults(version?: string): Promise<ModelResult[]> {
  const allResults = await loadAllResults();
  
  const targetVersion = version ?? await getLatestVersion();
  if (!targetVersion) return [];

  // Filter to requested version and get best result per model
  const versionResults = allResults.filter((r) => r.version === targetVersion);
  
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

export async function getAllVersions(): Promise<string[]> {
  try {
    const versions = await readdir(RESULTS_DIR);
    return versions
      .filter((v) => v !== 'README.md')
      .sort((a, b) => {
        // Sort lexicographically - works with 0.1.0-YYYYMMDDHHMM format
        return b.localeCompare(a);
      });
  } catch {
    return [];
  }
}

export async function loadTasks(): Promise<TaskDefinition[]> {
  const tasks: TaskDefinition[] = [];

  try {
    const indexContent = await readFile(join(TASKS_DIR, 'index.json'), 'utf-8');
    const index = JSON.parse(indexContent);

    for (const taskId of index.tasks) {
      const taskPath = join(TASKS_DIR, taskId);
      const taskStat = await stat(taskPath).catch(() => null);
      
      let task: TaskDefinition;
      if (taskStat?.isDirectory()) {
        // New directory format
        const taskContent = await readFile(join(taskPath, 'task.json'), 'utf-8');
        task = JSON.parse(taskContent);
      } else {
        // Legacy JSON file format
        const taskContent = await readFile(join(TASKS_DIR, `${taskId}.json`), 'utf-8');
        task = JSON.parse(taskContent);
      }
      tasks.push(task as TaskDefinition);
    }
  } catch {
    // No tasks yet
  }

  return tasks;
}

export function formatScore(score: number): string {
  return `${(score * 100).toFixed(1)}%`;
}

export function formatDate(timestamp: string): string {
  return new Date(timestamp).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}
