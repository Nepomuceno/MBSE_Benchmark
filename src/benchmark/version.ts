import { readdir, stat } from "fs/promises";
import { join } from "path";

let cachedVersion: string | null = null;

export async function computeVersion(basePath: string = "."): Promise<string> {
  if (cachedVersion) {
    return cachedVersion;
  }

  // Find the latest modification time across all benchmark files
  const tasksDir = join(basePath, "data/tasks");
  let latestMtime = await getLatestMtime(tasksDir);

  // Also check benchmark config
  const configPath = join(basePath, "config/benchmark.json");
  try {
    const configStat = await stat(configPath);
    if (configStat.mtimeMs > latestMtime) {
      latestMtime = configStat.mtimeMs;
    }
  } catch {
    // Config doesn't exist yet
  }

  // Create a semver-compatible version with chronological suffix
  // Format: 0.1.0-YYYYMMDDHHMM
  const date = new Date(latestMtime);
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  const hours = String(date.getUTCHours()).padStart(2, "0");
  const minutes = String(date.getUTCMinutes()).padStart(2, "0");

  cachedVersion = `0.1.0-${year}${month}${day}${hours}${minutes}`;
  return cachedVersion;
}

async function getLatestMtime(dirPath: string): Promise<number> {
  let latestMtime = 0;

  let entries;
  try {
    entries = await readdir(dirPath, { withFileTypes: true });
  } catch {
    return latestMtime;
  }

  for (const entry of entries) {
    const fullPath = join(dirPath, entry.name);

    if (entry.isDirectory()) {
      const dirMtime = await getLatestMtime(fullPath);
      if (dirMtime > latestMtime) {
        latestMtime = dirMtime;
      }
    } else if (entry.isFile() && entry.name.endsWith(".json")) {
      const fileStat = await stat(fullPath);
      if (fileStat.mtimeMs > latestMtime) {
        latestMtime = fileStat.mtimeMs;
      }
    }
  }

  return latestMtime;
}

export function clearVersionCache(): void {
  cachedVersion = null;
}
