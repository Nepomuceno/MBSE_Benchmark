import { describe, test, expect } from "bun:test";
import { createVirtualFS } from "./virtual-fs.js";

describe("VirtualFileSystem", () => {
  describe("basic operations", () => {
    test("creates empty filesystem", () => {
      const fs = createVirtualFS();
      expect(fs.listFiles("")).toEqual([]);
    });

    test("initializes with provided files", () => {
      const fs = createVirtualFS({
        "file.txt": "content",
        "dir/nested.txt": "nested content",
      });
      expect(fs.readFile("file.txt")).toBe("content");
      expect(fs.readFile("dir/nested.txt")).toBe("nested content");
    });

    test("writes and reads file", () => {
      const fs = createVirtualFS();
      fs.writeFile("test.txt", "hello world");
      expect(fs.readFile("test.txt")).toBe("hello world");
    });

    test("creates nested directories automatically", () => {
      const fs = createVirtualFS();
      fs.writeFile("a/b/c/file.txt", "deep");
      expect(fs.readFile("a/b/c/file.txt")).toBe("deep");
      expect(fs.isDirectory("a")).toBe(true);
      expect(fs.isDirectory("a/b")).toBe(true);
      expect(fs.isDirectory("a/b/c")).toBe(true);
    });

    test("overwrites existing file", () => {
      const fs = createVirtualFS({ "file.txt": "old" });
      fs.writeFile("file.txt", "new");
      expect(fs.readFile("file.txt")).toBe("new");
    });
  });

  describe("exists and isDirectory", () => {
    test("checks file existence", () => {
      const fs = createVirtualFS({ "file.txt": "content" });
      expect(fs.exists("file.txt")).toBe(true);
      expect(fs.exists("missing.txt")).toBe(false);
    });

    test("checks directory existence", () => {
      const fs = createVirtualFS({ "dir/file.txt": "content" });
      expect(fs.exists("dir")).toBe(true);
      expect(fs.isDirectory("dir")).toBe(true);
      expect(fs.isDirectory("dir/file.txt")).toBe(false);
    });
  });

  describe("listFiles", () => {
    test("lists root directory", () => {
      const fs = createVirtualFS({
        "file1.txt": "a",
        "file2.txt": "b",
        "dir/nested.txt": "c",
      });
      const files = fs.listFiles("");
      expect(files).toContain("file1.txt");
      expect(files).toContain("file2.txt");
      expect(files).toContain("dir/");
    });

    test("lists subdirectory", () => {
      const fs = createVirtualFS({
        "dir/a.txt": "a",
        "dir/b.txt": "b",
        "dir/sub/c.txt": "c",
      });
      const files = fs.listFiles("dir");
      expect(files).toContain("a.txt");
      expect(files).toContain("b.txt");
      expect(files).toContain("sub/");
    });

    test("throws for non-existent directory", () => {
      const fs = createVirtualFS();
      expect(() => fs.listFiles("missing")).toThrow("Directory not found");
    });

    test("throws for file path", () => {
      const fs = createVirtualFS({ "file.txt": "content" });
      expect(() => fs.listFiles("file.txt")).toThrow("Not a directory");
    });
  });

  describe("mkdir", () => {
    test("creates directory", () => {
      const fs = createVirtualFS();
      fs.mkdir("newdir");
      expect(fs.isDirectory("newdir")).toBe(true);
    });

    test("creates nested directories", () => {
      const fs = createVirtualFS();
      fs.mkdir("a/b/c");
      expect(fs.isDirectory("a/b/c")).toBe(true);
    });

    test("is idempotent", () => {
      const fs = createVirtualFS();
      fs.mkdir("dir");
      fs.mkdir("dir");
      expect(fs.isDirectory("dir")).toBe(true);
    });
  });

  describe("getSnapshot", () => {
    test("returns all files", () => {
      const fs = createVirtualFS({
        "a.txt": "content a",
        "dir/b.txt": "content b",
        "dir/sub/c.txt": "content c",
      });
      const snapshot = fs.getSnapshot();
      expect(snapshot).toEqual({
        "a.txt": "content a",
        "dir/b.txt": "content b",
        "dir/sub/c.txt": "content c",
      });
    });
  });

  describe("errors", () => {
    test("throws when reading non-existent file", () => {
      const fs = createVirtualFS();
      expect(() => fs.readFile("missing.txt")).toThrow("File not found");
    });

    test("throws when reading directory as file", () => {
      const fs = createVirtualFS({ "dir/file.txt": "content" });
      expect(() => fs.readFile("dir")).toThrow("Not a file");
    });
  });
});
