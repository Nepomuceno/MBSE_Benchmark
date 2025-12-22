import { describe, test, expect, beforeEach } from "bun:test";
import { computeVersion, clearVersionCache } from "./version.js";

describe("computeVersion", () => {
  beforeEach(() => {
    clearVersionCache();
  });

  test("returns semver-compatible version", async () => {
    const version = await computeVersion(".");
    expect(version).toMatch(/^\d+\.\d+\.\d+$/);
  });

  test("is deterministic", async () => {
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
