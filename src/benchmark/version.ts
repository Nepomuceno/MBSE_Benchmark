import { createHash } from "crypto";
import { readdir, readFile } from "fs/promises";
import { join } from "path";

let cachedVersion: string | null = null;

export async function computeVersion(basePath: string = "."): Promise<string> {
  if (cachedVersion) {
    return cachedVersion;
  }

  const hash = createHash("sha256");

  // Hash task definitions
  const tasksDir = join(basePath, "data/tasks");
  await hashDirectory(hash, tasksDir);

  // Hash tool definitions (filesystem tools are stable, but include for completeness)
  hash.update("filesystem-tools-v1");

  // Hash benchmark config
  const configPath = join(basePath, "config/benchmark.json");
  try {
    const configContent = await readFile(configPath, "utf-8");
    hash.update(configContent);
  } catch {
    // Config doesn't exist yet
  }

  const fullHash = hash.digest("hex");
  // Create a semver-like version from the hash
  const major = 0;
  const minor = 1;
  const patch = parseInt(fullHash.slice(0, 8), 16) % 1000;

  cachedVersion = `${major}.${minor}.${patch}`;
  return cachedVersion;
}

async function hashDirectory(hash: ReturnType<typeof createHash>, dirPath: string): Promise<void> {
  let entries;
  try {
    entries = await readdir(dirPath, { withFileTypes: true });
  } catch {
    return;
  }

  // Sort for deterministic ordering
  entries.sort((a, b) => a.name.localeCompare(b.name));

  for (const entry of entries) {
    const fullPath = join(dirPath, entry.name);

    if (entry.isDirectory()) {
      hash.update(`dir:${entry.name}`);
      await hashDirectory(hash, fullPath);
    } else if (entry.isFile() && entry.name.endsWith(".json")) {
      const content = await readFile(fullPath, "utf-8");
      hash.update(`file:${entry.name}:${content}`);
    }
  }
}

export function clearVersionCache(): void {
  cachedVersion = null;
}
