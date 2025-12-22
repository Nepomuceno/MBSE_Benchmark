export { createVirtualFS } from "./virtual-fs.js";
export { createFileSystemTools } from "./tools.js";
export { parseUnifiedDiff, applyPatchToContent } from "./patch.js";
export type {
  VirtualFileSystem,
  FSEntry,
  FileEntry,
  DirectoryEntry,
  PatchResult,
  FilePatch,
  PatchHunk,
  PatchLine,
} from "./types.js";
export type { FileSystemTools } from "./tools.js";
