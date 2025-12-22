export interface FileEntry {
  type: "file";
  content: string;
}

export interface DirectoryEntry {
  type: "directory";
  children: Map<string, FSEntry>;
}

export type FSEntry = FileEntry | DirectoryEntry;

export interface VirtualFileSystem {
  readFile(path: string): string;
  writeFile(path: string, content: string): void;
  exists(path: string): boolean;
  isDirectory(path: string): boolean;
  listFiles(path: string): string[];
  mkdir(path: string): void;
  applyPatch(patch: string): PatchResult;
  getSnapshot(): Record<string, string>;
}

export interface PatchResult {
  success: boolean;
  filesModified: string[];
  errors: string[];
}

export interface PatchHunk {
  oldStart: number;
  oldLines: number;
  newStart: number;
  newLines: number;
  lines: PatchLine[];
}

export interface PatchLine {
  type: "context" | "add" | "remove";
  content: string;
}

export interface FilePatch {
  oldPath: string;
  newPath: string;
  hunks: PatchHunk[];
  isNewFile: boolean;
  isDeleted: boolean;
}
