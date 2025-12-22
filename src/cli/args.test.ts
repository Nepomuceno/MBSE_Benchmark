import { describe, expect, test } from "bun:test";
import { parseArgs } from "./args";

describe("parseArgs", () => {
  test("parses --model flag", () => {
    const args = parseArgs(["--model", "gpt-4"]);
    expect(args.model).toBe("gpt-4");
  });

  test("parses -m shorthand", () => {
    const args = parseArgs(["-m", "claude"]);
    expect(args.model).toBe("claude");
  });

  test("parses --all flag", () => {
    const args = parseArgs(["--all"]);
    expect(args.all).toBe(true);
  });

  test("parses --force flag", () => {
    const args = parseArgs(["--force"]);
    expect(args.force).toBe(true);
  });

  test("parses multiple flags", () => {
    const args = parseArgs(["--model", "gpt-4", "--force"]);
    expect(args.model).toBe("gpt-4");
    expect(args.force).toBe(true);
  });

  test("returns empty object for no args", () => {
    const args = parseArgs([]);
    expect(args).toEqual({});
  });
});
