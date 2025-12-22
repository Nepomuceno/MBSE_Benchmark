import { describe, test, expect } from "bun:test";
import { createVirtualFS } from "./virtual-fs.js";
import { createFileSystemTools } from "./tools.js";

describe("FileSystemTools", () => {
  describe("readFile tool", () => {
    test("reads existing file", async () => {
      const fs = createVirtualFS({ "test.txt": "hello world" });
      const tools = createFileSystemTools(fs);

      const result = await tools.execute("readFile", { path: "test.txt" });
      expect(result).toEqual({ content: "hello world" });
    });

    test("returns error for missing file", async () => {
      const fs = createVirtualFS();
      const tools = createFileSystemTools(fs);

      const result = await tools.execute("readFile", { path: "missing.txt" });
      expect(result).toEqual({ error: "File not found: missing.txt" });
    });
  });

  describe("listFiles tool", () => {
    test("lists directory contents", async () => {
      const fs = createVirtualFS({
        "file.txt": "content",
        "dir/nested.txt": "nested",
      });
      const tools = createFileSystemTools(fs);

      const result = await tools.execute("listFiles", { path: "" });
      expect(result).toEqual({ files: ["dir/", "file.txt"] });
    });

    test("returns error for missing directory", async () => {
      const fs = createVirtualFS();
      const tools = createFileSystemTools(fs);

      const result = await tools.execute("listFiles", { path: "missing" });
      expect(result).toEqual({ error: "Directory not found: missing" });
    });
  });

  describe("patchFile tool", () => {
    test("creates new file", async () => {
      const fs = createVirtualFS();
      const tools = createFileSystemTools(fs);

      const patch = `--- /dev/null
+++ b/newfile.txt
@@ -0,0 +1,2 @@
+line 1
+line 2`;

      const result = await tools.execute("patchFile", { patch });
      expect(result).toEqual({
        success: true,
        filesModified: ["newfile.txt"],
      });
      expect(fs.readFile("newfile.txt")).toBe("line 1\nline 2");
    });

    test("modifies existing file", async () => {
      const fs = createVirtualFS({ "file.txt": "line 1\nline 2\nline 3" });
      const tools = createFileSystemTools(fs);

      const patch = `--- a/file.txt
+++ b/file.txt
@@ -1,3 +1,4 @@
 line 1
+inserted
 line 2
 line 3`;

      const result = await tools.execute("patchFile", { patch });
      expect(result).toEqual({
        success: true,
        filesModified: ["file.txt"],
      });
      expect(fs.readFile("file.txt")).toBe("line 1\ninserted\nline 2\nline 3");
    });

    test("deletes file", async () => {
      const fs = createVirtualFS({ "file.txt": "content" });
      const tools = createFileSystemTools(fs);

      const patch = `--- a/file.txt
+++ /dev/null
@@ -1 +0,0 @@
-content`;

      const result = await tools.execute("patchFile", { patch });
      expect(result).toEqual({
        success: true,
        filesModified: ["file.txt"],
      });
      expect(fs.exists("file.txt")).toBe(false);
    });

    test("returns error for invalid patch target", async () => {
      const fs = createVirtualFS();
      const tools = createFileSystemTools(fs);

      const patch = `--- a/missing.txt
+++ b/missing.txt
@@ -1 +1 @@
-old
+new`;

      const result = (await tools.execute("patchFile", { patch })) as {
        success: boolean;
        errors: string[];
      };
      expect(result.success).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe("tool definitions", () => {
    test("has all required tools", () => {
      const fs = createVirtualFS();
      const tools = createFileSystemTools(fs);

      const names = tools.definitions.map((t) => t.name);
      expect(names).toContain("readFile");
      expect(names).toContain("listFiles");
      expect(names).toContain("patchFile");
    });

    test("tools have descriptions", () => {
      const fs = createVirtualFS();
      const tools = createFileSystemTools(fs);

      for (const tool of tools.definitions) {
        expect(tool.description.length).toBeGreaterThan(0);
      }
    });
  });

  describe("unknown tool", () => {
    test("returns error for unknown tool", async () => {
      const fs = createVirtualFS();
      const tools = createFileSystemTools(fs);

      const result = await tools.execute("unknownTool", {});
      expect(result).toEqual({ error: "Unknown tool: unknownTool" });
    });
  });
});
