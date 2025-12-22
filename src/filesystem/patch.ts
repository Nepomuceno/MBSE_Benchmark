import type { FilePatch, PatchHunk, PatchLine } from "./types.js";

export function parseUnifiedDiff(diff: string): FilePatch[] {
  const patches: FilePatch[] = [];
  const lines = diff.split("\n");
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    if (!line) {
      i++;
      continue;
    }

    // Look for file header
    if (line.startsWith("--- ")) {
      const patch = parseFilePatch(lines, i);
      if (patch) {
        patches.push(patch.patch);
        i = patch.nextIndex;
        continue;
      }
    }
    i++;
  }

  return patches;
}

function parseFilePatch(
  lines: string[],
  startIndex: number
): { patch: FilePatch; nextIndex: number } | null {
  const oldPathLine = lines[startIndex];
  const newPathLine = lines[startIndex + 1];

  if (!oldPathLine?.startsWith("--- ") || !newPathLine?.startsWith("+++ ")) {
    return null;
  }

  const oldPath = extractPath(oldPathLine.slice(4));
  const newPath = extractPath(newPathLine.slice(4));

  const isNewFile = oldPath === "/dev/null";
  const isDeleted = newPath === "/dev/null";

  const hunks: PatchHunk[] = [];
  let i = startIndex + 2;

  while (i < lines.length) {
    const line = lines[i];
    if (!line) {
      i++;
      continue;
    }

    // New file starts
    if (line.startsWith("--- ")) {
      break;
    }

    // Parse hunk header
    if (line.startsWith("@@ ")) {
      const hunk = parseHunk(lines, i);
      if (hunk) {
        hunks.push(hunk.hunk);
        i = hunk.nextIndex;
        continue;
      }
    }
    i++;
  }

  return {
    patch: {
      oldPath: isNewFile ? newPath : oldPath,
      newPath: isDeleted ? oldPath : newPath,
      hunks,
      isNewFile,
      isDeleted,
    },
    nextIndex: i,
  };
}

function parseHunk(
  lines: string[],
  startIndex: number
): { hunk: PatchHunk; nextIndex: number } | null {
  const headerLine = lines[startIndex];
  if (!headerLine) return null;

  // Parse @@ -1,3 +1,4 @@ format
  const match = headerLine.match(/@@ -(\d+)(?:,(\d+))? \+(\d+)(?:,(\d+))? @@/);
  if (!match) return null;

  const oldStart = parseInt(match[1]!, 10);
  const oldLines = match[2] ? parseInt(match[2], 10) : 1;
  const newStart = parseInt(match[3]!, 10);
  const newLines = match[4] ? parseInt(match[4], 10) : 1;

  const patchLines: PatchLine[] = [];
  let i = startIndex + 1;

  while (i < lines.length) {
    const line = lines[i];

    // End of hunk - next hunk or file starts
    if (
      line === undefined ||
      line.startsWith("@@ ") ||
      line.startsWith("--- ")
    ) {
      break;
    }

    if (line.startsWith("+")) {
      patchLines.push({ type: "add", content: line.slice(1) });
    } else if (line.startsWith("-")) {
      patchLines.push({ type: "remove", content: line.slice(1) });
    } else if (line.startsWith(" ") || line === "") {
      patchLines.push({ type: "context", content: line.slice(1) });
    }

    i++;
  }

  return {
    hunk: { oldStart, oldLines, newStart, newLines, lines: patchLines },
    nextIndex: i,
  };
}

function extractPath(pathStr: string): string {
  // Remove a/ or b/ prefix and any trailing whitespace/timestamps
  let path = pathStr.trim();

  // Handle git-style prefixes
  if (path.startsWith("a/") || path.startsWith("b/")) {
    path = path.slice(2);
  }

  // Remove timestamp if present (e.g., "2024-01-01 12:00:00.000000000 +0000")
  const tabIndex = path.indexOf("\t");
  if (tabIndex !== -1) {
    path = path.slice(0, tabIndex);
  }

  return path;
}

export function applyPatchToContent(content: string, hunks: PatchHunk[]): string {
  const lines = content.split("\n");

  // Process hunks in reverse order to maintain correct line numbers
  const sortedHunks = [...hunks].sort((a, b) => b.oldStart - a.oldStart);

  for (const hunk of sortedHunks) {
    const startIndex = hunk.oldStart - 1;
    const newLines: string[] = [];

    // Build the new content from the patch
    for (const patchLine of hunk.lines) {
      if (patchLine.type === "context" || patchLine.type === "add") {
        newLines.push(patchLine.content);
      }
      // "remove" lines are simply not included in newLines
    }

    // Replace the old lines with new lines
    lines.splice(startIndex, hunk.oldLines, ...newLines);
  }

  return lines.join("\n");
}
