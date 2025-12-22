import { readdir, readFile } from "fs/promises";
import { join } from "path";
import type { Task, TaskIndex, LoadedTask } from "./types.js";
import { validateTask } from "./validator.js";

const TASKS_DIR = "data/tasks";

export async function loadTaskIndex(basePath: string = "."): Promise<TaskIndex> {
  const indexPath = join(basePath, TASKS_DIR, "index.json");
  const content = await readFile(indexPath, "utf-8");
  return JSON.parse(content) as TaskIndex;
}

export async function loadTask(
  taskId: string,
  basePath: string = "."
): Promise<LoadedTask> {
  const taskDir = join(basePath, TASKS_DIR, taskId);

  // Try new directory structure first
  let taskPath = join(taskDir, "task.json");
  let taskContent: string;
  let isDirectoryStructure = true;

  try {
    taskContent = await readFile(taskPath, "utf-8");
  } catch {
    // Fall back to flat file structure
    taskPath = join(basePath, TASKS_DIR, `${taskId}.json`);
    taskContent = await readFile(taskPath, "utf-8");
    isDirectoryStructure = false;
  }

  const task = JSON.parse(taskContent) as Task;

  // Validate task
  const validation = validateTask(task);
  if (!validation.valid) {
    throw new Error(`Invalid task ${taskId}: ${validation.errors.join(", ")}`);
  }

  // Load initial files if specified
  let initialFiles: Record<string, string> = {};

  if (isDirectoryStructure && task.files?.initial) {
    const filesDir = join(taskDir, task.files.initial);
    initialFiles = await loadFilesRecursively(filesDir);
  }

  return {
    ...task,
    initialFiles,
  };
}

export async function loadAllTasks(basePath: string = "."): Promise<LoadedTask[]> {
  const index = await loadTaskIndex(basePath);
  const tasks: LoadedTask[] = [];

  for (const taskId of index.tasks) {
    const task = await loadTask(taskId, basePath);
    tasks.push(task);
  }

  return tasks;
}

async function loadFilesRecursively(
  dirPath: string,
  relativePath: string = ""
): Promise<Record<string, string>> {
  const files: Record<string, string> = {};

  let entries;
  try {
    entries = await readdir(dirPath, { withFileTypes: true });
  } catch {
    return files; // Directory doesn't exist
  }

  for (const entry of entries) {
    const fullPath = join(dirPath, entry.name);
    const relPath = relativePath ? `${relativePath}/${entry.name}` : entry.name;

    if (entry.isDirectory()) {
      const subFiles = await loadFilesRecursively(fullPath, relPath);
      Object.assign(files, subFiles);
    } else if (entry.isFile()) {
      const content = await readFile(fullPath, "utf-8");
      files[relPath] = content;
    }
  }

  return files;
}

export async function getTaskIds(basePath: string = "."): Promise<string[]> {
  const index = await loadTaskIndex(basePath);
  return index.tasks;
}
