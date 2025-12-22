import { readdir } from 'fs/promises';
import { join } from 'path';

export interface TaskResult {
  taskId: string;
  score: number;
  response: string;
  latencyMs: number;
}

export interface ModelResult {
  version: string;
  modelId: string;
  timestamp: string;
  tasks: TaskResult[];
  score: number;
}

export interface TaskDefinition {
  id: string;
  name: string;
  description: string;
  prompt: string;
  expectedKeywords?: string[];
  maxTokens?: number;
  evaluation: {
    type: string;
    weight: number;
  };
}

const RESULTS_DIR = '../data/results';
const TASKS_DIR = '../data/tasks';

export async function loadResults(): Promise<ModelResult[]> {
  const results: ModelResult[] = [];

  try {
    const versions = await readdir(RESULTS_DIR);

    for (const version of versions) {
      if (version === 'README.md') continue;

      const versionPath = join(RESULTS_DIR, version);
      const files = await readdir(versionPath);

      for (const file of files) {
        if (!file.endsWith('.json')) continue;

        const content = await Bun.file(join(versionPath, file)).json();
        results.push(content as ModelResult);
      }
    }
  } catch {
    // No results yet
  }

  return results.sort((a, b) => b.score - a.score);
}

export async function loadTasks(): Promise<TaskDefinition[]> {
  const tasks: TaskDefinition[] = [];

  try {
    const index = await Bun.file(join(TASKS_DIR, 'index.json')).json();

    for (const taskId of index.tasks) {
      const task = await Bun.file(join(TASKS_DIR, `${taskId}.json`)).json();
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
