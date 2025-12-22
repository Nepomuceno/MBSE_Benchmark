import type { ToolDefinition } from "../models/types.js";
import type { VirtualFileSystem } from "./types.js";

export interface FileSystemTools {
  definitions: ToolDefinition[];
  execute: (
    toolName: string,
    args: Record<string, unknown>
  ) => Promise<unknown>;
}

export function createFileSystemTools(fs: VirtualFileSystem): FileSystemTools {
  const definitions: ToolDefinition[] = [
    {
      name: "readFile",
      description:
        "Read the contents of a file at the specified path. Returns the file content as a string.",
      parameters: {
        path: {
          type: "string",
          description: "The path to the file to read",
        },
      },
    },
    {
      name: "listFiles",
      description:
        "List files and directories at the specified path. Directories are suffixed with '/'. Returns an array of names.",
      parameters: {
        path: {
          type: "string",
          description:
            "The path to the directory to list. Use '' or '/' for root.",
        },
      },
    },
    {
      name: "patchFile",
      description: `Apply a unified diff patch to create, modify, or delete files. 
Use standard unified diff format:
- To create a new file, use '--- /dev/null' as the old path
- To delete a file, use '+++ /dev/null' as the new path  
- To modify a file, provide hunks with context, additions (+), and removals (-)

Example to create a new file:
--- /dev/null
+++ b/newfile.txt
@@ -0,0 +1,3 @@
+line 1
+line 2
+line 3

Example to modify a file:
--- a/existing.txt
+++ b/existing.txt
@@ -1,3 +1,4 @@
 line 1
+inserted line
 line 2
 line 3`,
      parameters: {
        patch: {
          type: "string",
          description: "The unified diff patch to apply",
        },
      },
    },
  ];

  async function execute(
    toolName: string,
    args: Record<string, unknown>
  ): Promise<unknown> {
    switch (toolName) {
      case "readFile": {
        const path = args.path as string;
        try {
          return { content: fs.readFile(path) };
        } catch (e) {
          return {
            error: e instanceof Error ? e.message : "Failed to read file",
          };
        }
      }

      case "listFiles": {
        const path = (args.path as string) || "";
        try {
          return { files: fs.listFiles(path) };
        } catch (e) {
          return {
            error: e instanceof Error ? e.message : "Failed to list files",
          };
        }
      }

      case "patchFile": {
        const patch = args.patch as string;
        try {
          const result = fs.applyPatch(patch);
          if (result.success) {
            return {
              success: true,
              filesModified: result.filesModified,
            };
          } else {
            return {
              success: false,
              filesModified: result.filesModified,
              errors: result.errors,
            };
          }
        } catch (e) {
          return {
            error: e instanceof Error ? e.message : "Failed to apply patch",
          };
        }
      }

      default:
        return { error: `Unknown tool: ${toolName}` };
    }
  }

  return { definitions, execute };
}
