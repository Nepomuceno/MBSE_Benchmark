import { describe, test, expect, beforeEach } from "bun:test";
import { computeVersion, clearVersionCache } from "./version.js";

describe("computeVersion", () => {
  beforeEach(() => {
    clearVersionCache();
  });

  test("returns semver-compatible version with chronological suffix", async () => {
    const version = await computeVersion(".");
    // Format: 0.1.0-YYYYMMDDHHMM
    expect(version).toMatch(/^0\.1\.0-\d{12}$/);
  });

  test("version suffix is chronologically sortable", async () => {
    const version = await computeVersion(".");
    // Extract the suffix (YYYYMMDDHHMM)
    const suffix = version.replace("0.1.0-", "");

    // Validate format (12 digits)
    expect(suffix).toHaveLength(12);
    const year = parseInt(suffix.slice(0, 4));
    const month = parseInt(suffix.slice(4, 6));
    const day = parseInt(suffix.slice(6, 8));
    const hours = parseInt(suffix.slice(8, 10));
    const minutes = parseInt(suffix.slice(10, 12));

    expect(year).toBeGreaterThanOrEqual(2024);
    expect(month).toBeGreaterThanOrEqual(1);
    expect(month).toBeLessThanOrEqual(12);
    expect(day).toBeGreaterThanOrEqual(1);
    expect(day).toBeLessThanOrEqual(31);
    expect(hours).toBeGreaterThanOrEqual(0);
    expect(hours).toBeLessThanOrEqual(23);
    expect(minutes).toBeGreaterThanOrEqual(0);
    expect(minutes).toBeLessThanOrEqual(59);
  });

  test("is deterministic based on file timestamps", async () => {
    const version1 = await computeVersion(".");
    clearVersionCache();
    const version2 = await computeVersion(".");

    expect(version1).toBe(version2);
  });

  test("caches version", async () => {
    const version1 = await computeVersion(".");
    const version2 = await computeVersion(".");

    expect(version1).toBe(version2);
  });
});
