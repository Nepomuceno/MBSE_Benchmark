import { describe, test, expect } from "bun:test";
import { parseUnifiedDiff, applyPatchToContent } from "./patch.js";

describe("parseUnifiedDiff", () => {
  test("parses simple modification", () => {
    const diff = `--- a/file.txt
+++ b/file.txt
@@ -1,3 +1,4 @@
 line 1
+inserted line
 line 2
 line 3`;

    const patches = parseUnifiedDiff(diff);
    expect(patches.length).toBe(1);
    expect(patches[0]!.oldPath).toBe("file.txt");
    expect(patches[0]!.newPath).toBe("file.txt");
    expect(patches[0]!.isNewFile).toBe(false);
    expect(patches[0]!.isDeleted).toBe(false);
    expect(patches[0]!.hunks.length).toBe(1);
  });

  test("parses new file creation", () => {
    const diff = `--- /dev/null
+++ b/newfile.txt
@@ -0,0 +1,3 @@
+line 1
+line 2
+line 3`;

    const patches = parseUnifiedDiff(diff);
    expect(patches.length).toBe(1);
    expect(patches[0]!.isNewFile).toBe(true);
    expect(patches[0]!.newPath).toBe("newfile.txt");
  });

  test("parses file deletion", () => {
    const diff = `--- a/oldfile.txt
+++ /dev/null
@@ -1,3 +0,0 @@
-line 1
-line 2
-line 3`;

    const patches = parseUnifiedDiff(diff);
    expect(patches.length).toBe(1);
    expect(patches[0]!.isDeleted).toBe(true);
    expect(patches[0]!.oldPath).toBe("oldfile.txt");
  });

  test("parses multiple files", () => {
    const diff = `--- a/file1.txt
+++ b/file1.txt
@@ -1 +1 @@
-old content
+new content
--- a/file2.txt
+++ b/file2.txt
@@ -1 +1,2 @@
 existing
+added`;

    const patches = parseUnifiedDiff(diff);
    expect(patches.length).toBe(2);
    expect(patches[0]!.oldPath).toBe("file1.txt");
    expect(patches[1]!.oldPath).toBe("file2.txt");
  });

  test("parses multiple hunks", () => {
    const diff = `--- a/file.txt
+++ b/file.txt
@@ -1,3 +1,4 @@
 line 1
+inserted after 1
 line 2
 line 3
@@ -10,3 +11,4 @@
 line 10
+inserted after 10
 line 11
 line 12`;

    const patches = parseUnifiedDiff(diff);
    expect(patches.length).toBe(1);
    expect(patches[0]!.hunks.length).toBe(2);
  });

  test("handles paths without a/ b/ prefix", () => {
    const diff = `--- file.txt
+++ file.txt
@@ -1 +1 @@
-old
+new`;

    const patches = parseUnifiedDiff(diff);
    expect(patches[0]!.oldPath).toBe("file.txt");
  });
});

describe("applyPatchToContent", () => {
  test("inserts line", () => {
    const content = "line 1\nline 2\nline 3";
    const hunks = [
      {
        oldStart: 1,
        oldLines: 3,
        newStart: 1,
        newLines: 4,
        lines: [
          { type: "context" as const, content: "line 1" },
          { type: "add" as const, content: "inserted" },
          { type: "context" as const, content: "line 2" },
          { type: "context" as const, content: "line 3" },
        ],
      },
    ];

    const result = applyPatchToContent(content, hunks);
    expect(result).toBe("line 1\ninserted\nline 2\nline 3");
  });

  test("removes line", () => {
    const content = "line 1\nline 2\nline 3";
    const hunks = [
      {
        oldStart: 1,
        oldLines: 3,
        newStart: 1,
        newLines: 2,
        lines: [
          { type: "context" as const, content: "line 1" },
          { type: "remove" as const, content: "line 2" },
          { type: "context" as const, content: "line 3" },
        ],
      },
    ];

    const result = applyPatchToContent(content, hunks);
    expect(result).toBe("line 1\nline 3");
  });

  test("replaces line", () => {
    const content = "line 1\nline 2\nline 3";
    const hunks = [
      {
        oldStart: 1,
        oldLines: 3,
        newStart: 1,
        newLines: 3,
        lines: [
          { type: "context" as const, content: "line 1" },
          { type: "remove" as const, content: "line 2" },
          { type: "add" as const, content: "replaced line" },
          { type: "context" as const, content: "line 3" },
        ],
      },
    ];

    const result = applyPatchToContent(content, hunks);
    expect(result).toBe("line 1\nreplaced line\nline 3");
  });
});
