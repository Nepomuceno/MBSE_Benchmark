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

  test("parses --debug flag", () => {
    const args = parseArgs(["--debug"]);
    expect(args.debug).toBe(true);
  });

  test("parses -d shorthand for debug", () => {
    const args = parseArgs(["-d"]);
    expect(args.debug).toBe(true);
  });

  test("parses --task flag", () => {
    const args = parseArgs(["--task", "sysml-01"]);
    expect(args.task).toBe("sysml-01");
  });

  test("parses -t shorthand for task", () => {
    const args = parseArgs(["-t", "sysml-02"]);
    expect(args.task).toBe("sysml-02");
  });

  test("parses debug mode with model and task", () => {
    const args = parseArgs(["--debug", "--model", "gpt-4", "--task", "sysml-01"]);
    expect(args.debug).toBe(true);
    expect(args.model).toBe("gpt-4");
    expect(args.task).toBe("sysml-01");
  });
});
