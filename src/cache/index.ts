import type { BenchmarkResult } from "../benchmark";

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
  await Bun.write(`${dir}/${result.modelId}.json`, JSON.stringify(result, null, 2));
}

export async function hasResult(version: string, modelId: string): Promise<boolean> {
  const path = `${RESULTS_DIR}/${version}/${modelId}.json`;
  return Bun.file(path).exists();
}
