import { mkdir } from "fs/promises";
import type { BenchmarkResult } from "../benchmark/index.js";

const RESULTS_DIR = "./data/results";

export async function getCachedResult(
  version: string,
  modelId: string
): Promise<BenchmarkResult | null> {
  const path = `${RESULTS_DIR}/${version}/${modelId}.json`;
  const file = Bun.file(path);

  if (await file.exists()) {
    return file.json();
  }
  return null;
}

export async function saveResult(result: BenchmarkResult): Promise<void> {
  const dir = `${RESULTS_DIR}/${result.version}`;
  
  // Ensure directory exists
  await mkdir(dir, { recursive: true });
  
  await Bun.write(
    `${dir}/${result.modelId}.json`,
    JSON.stringify(result, null, 2)
  );
}

export async function hasResult(version: string, modelId: string): Promise<boolean> {
  const path = `${RESULTS_DIR}/${version}/${modelId}.json`;
  return Bun.file(path).exists();
}

export async function listResults(version?: string): Promise<string[]> {
  const baseDir = version ? `${RESULTS_DIR}/${version}` : RESULTS_DIR;
  
  try {
    const dir = await import("fs/promises").then((fs) => fs.readdir(baseDir));
    return dir.filter((f) => f.endsWith(".json")).map((f) => f.replace(".json", ""));
  } catch {
    return [];
  }
}
