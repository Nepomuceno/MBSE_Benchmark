import type {
  VirtualFileSystem,
  FSEntry,
  DirectoryEntry,
  PatchResult,
} from "./types.js";
import { parseUnifiedDiff, applyPatchToContent } from "./patch.js";

export function createVirtualFS(
  initialFiles?: Record<string, string>
): VirtualFileSystem {
  const root: DirectoryEntry = { type: "directory", children: new Map() };

  // Initialize with provided files
  if (initialFiles) {
    for (const [path, content] of Object.entries(initialFiles)) {
      writeFileInternal(root, path, content);
    }
  }

  function normalizePath(path: string): string[] {
    return path
      .replace(/^\/+/, "")
      .replace(/\/+$/, "")
      .split("/")
      .filter((p) => p.length > 0);
  }

  function getEntry(path: string): FSEntry | undefined {
    const parts = normalizePath(path);
    if (parts.length === 0) return root;

    let current: FSEntry = root;
    for (const part of parts) {
      if (current.type !== "directory") return undefined;
      const next = current.children.get(part);
      if (!next) return undefined;
      current = next;
    }
    return current;
  }

  function getParentDir(path: string): DirectoryEntry | undefined {
    const parts = normalizePath(path);
    if (parts.length === 0) return undefined;

    let current: FSEntry = root;
    for (let i = 0; i < parts.length - 1; i++) {
      if (current.type !== "directory") return undefined;
      const next = current.children.get(parts[i]!);
      if (!next) return undefined;
      current = next;
    }
    return current.type === "directory" ? current : undefined;
  }

  function writeFileInternal(
    rootDir: DirectoryEntry,
    path: string,
    content: string
  ): void {
    const parts = normalizePath(path);
    if (parts.length === 0) {
      throw new Error("Cannot write to root");
    }

    let current: DirectoryEntry = rootDir;

    // Create directories as needed
    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i]!;
      let next = current.children.get(part);
      if (!next) {
        next = { type: "directory", children: new Map() };
        current.children.set(part, next);
      } else if (next.type !== "directory") {
        throw new Error(`Cannot create directory: ${part} is a file`);
      }
      current = next;
    }

    // Write the file
    const fileName = parts[parts.length - 1]!;
    current.children.set(fileName, { type: "file", content });
  }

  function mkdirInternal(path: string): void {
    const parts = normalizePath(path);
    if (parts.length === 0) return;

    let current: DirectoryEntry = root;
    for (const part of parts) {
      let next = current.children.get(part);
      if (!next) {
        next = { type: "directory", children: new Map() };
        current.children.set(part, next);
      } else if (next.type !== "directory") {
        throw new Error(`Cannot create directory: ${part} is a file`);
      }
      current = next;
    }
  }

  function collectFiles(
    dir: DirectoryEntry,
    basePath: string,
    result: Record<string, string>
  ): void {
    for (const [name, entry] of dir.children) {
      const fullPath = basePath ? `${basePath}/${name}` : name;
      if (entry.type === "file") {
        result[fullPath] = entry.content;
      } else {
        collectFiles(entry, fullPath, result);
      }
    }
  }

  return {
    readFile(path: string): string {
      const entry = getEntry(path);
      if (!entry) {
        throw new Error(`File not found: ${path}`);
      }
      if (entry.type !== "file") {
        throw new Error(`Not a file: ${path}`);
      }
      return entry.content;
    },

    writeFile(path: string, content: string): void {
      writeFileInternal(root, path, content);
    },

    exists(path: string): boolean {
      return getEntry(path) !== undefined;
    },

    isDirectory(path: string): boolean {
      const entry = getEntry(path);
      return entry?.type === "directory";
    },

    listFiles(path: string): string[] {
      const entry = path === "" || path === "/" ? root : getEntry(path);
      if (!entry) {
        throw new Error(`Directory not found: ${path}`);
      }
      if (entry.type !== "directory") {
        throw new Error(`Not a directory: ${path}`);
      }

      const result: string[] = [];
      for (const [name, child] of entry.children) {
        result.push(child.type === "directory" ? `${name}/` : name);
      }
      return result.sort();
    },

    mkdir(path: string): void {
      mkdirInternal(path);
    },

    applyPatch(patchContent: string): PatchResult {
      const patches = parseUnifiedDiff(patchContent);
      const filesModified: string[] = [];
      const errors: string[] = [];

      for (const patch of patches) {
        try {
          if (patch.isDeleted) {
            // Delete file
            const parts = normalizePath(patch.oldPath);
            const parent = getParentDir(patch.oldPath);
            if (parent && parts.length > 0) {
              parent.children.delete(parts[parts.length - 1]!);
              filesModified.push(patch.oldPath);
            }
          } else if (patch.isNewFile) {
            // Create new file
            const newContent = patch.hunks
              .flatMap((h) =>
                h.lines.filter((l) => l.type === "add").map((l) => l.content)
              )
              .join("\n");
            writeFileInternal(root, patch.newPath, newContent);
            filesModified.push(patch.newPath);
          } else {
            // Modify existing file
            const entry = getEntry(patch.oldPath);
            if (!entry || entry.type !== "file") {
              errors.push(`File not found: ${patch.oldPath}`);
              continue;
            }
            const newContent = applyPatchToContent(entry.content, patch.hunks);
            writeFileInternal(root, patch.newPath, newContent);
            filesModified.push(patch.newPath);
          }
        } catch (e) {
          errors.push(
            `Failed to apply patch to ${patch.newPath}: ${e instanceof Error ? e.message : String(e)}`
          );
        }
      }

      return {
        success: errors.length === 0,
        filesModified,
        errors,
      };
    },

    getSnapshot(): Record<string, string> {
      const result: Record<string, string> = {};
      collectFiles(root, "", result);
      return result;
    },
  };
}
