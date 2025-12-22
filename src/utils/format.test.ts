import { describe, expect, test } from "bun:test";
import { formatScore, formatDuration } from "./format";

describe("formatScore", () => {
  test("formats 0 as 0.0%", () => {
    expect(formatScore(0)).toBe("0.0%");
  });

  test("formats 1 as 100.0%", () => {
    expect(formatScore(1)).toBe("100.0%");
  });

  test("formats 0.5 as 50.0%", () => {
    expect(formatScore(0.5)).toBe("50.0%");
  });

  test("formats 0.123 as 12.3%", () => {
    expect(formatScore(0.123)).toBe("12.3%");
  });
});

describe("formatDuration", () => {
  test("formats milliseconds under 1000", () => {
    expect(formatDuration(500)).toBe("500ms");
  });

  test("formats seconds", () => {
    expect(formatDuration(1500)).toBe("1.50s");
  });

  test("formats 0ms", () => {
    expect(formatDuration(0)).toBe("0ms");
  });
});
