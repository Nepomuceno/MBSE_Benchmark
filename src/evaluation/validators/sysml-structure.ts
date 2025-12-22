/**
 * SysML v2 Structure Matcher
 *
 * Compare hierarchical structures of SysML v2 models.
 */

export type StructureNodeType =
  | "package"
  | "part"
  | "part-def"
  | "port"
  | "port-def"
  | "action"
  | "action-def"
  | "state"
  | "state-def"
  | "requirement"
  | "requirement-def"
  | "attribute"
  | "connection"
  | "constraint"
  | "item"
  | "item-def";

export interface StructureNode {
  name: string;
  type: StructureNodeType;
  children: StructureNode[];
}

export interface TreeComparisonResult {
  match: boolean;
  score: number;
  matched: MatchedNode[];
  missing: MissingNode[];
  extra: ExtraNode[];
  misplaced: MisplacedNode[];
}

export interface MatchedNode {
  name: string;
  type: StructureNodeType;
  path: string;
}

export interface MissingNode {
  name: string;
  type: StructureNodeType;
  expectedPath: string;
}

export interface ExtraNode {
  name: string;
  type: StructureNodeType;
  actualPath: string;
}

export interface MisplacedNode {
  name: string;
  type: StructureNodeType;
  expectedPath: string;
  actualPath: string;
}

function removeComments(input: string): string {
  return input.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/gm, "");
}

interface ParseContext {
  content: string;
  position: number;
}

function skipWhitespace(ctx: ParseContext): void {
  while (ctx.position < ctx.content.length && /\s/.test(ctx.content[ctx.position]!)) {
    ctx.position++;
  }
}

function parseBlock(ctx: ParseContext): StructureNode[] {
  const nodes: StructureNode[] = [];
  skipWhitespace(ctx);

  while (ctx.position < ctx.content.length && ctx.content[ctx.position] !== "}") {
    const node = parseElement(ctx);
    if (node) {
      nodes.push(node);
    }
    skipWhitespace(ctx);
  }

  // Skip closing brace if present
  if (ctx.position < ctx.content.length && ctx.content[ctx.position] === "}") {
    ctx.position++;
  }

  return nodes;
}

function parseElement(ctx: ParseContext): StructureNode | null {
  skipWhitespace(ctx);

  // Match different element patterns
  const remaining = ctx.content.slice(ctx.position);

  // Package
  const packageMatch = remaining.match(/^package\s+(\w+)\s*\{/);
  if (packageMatch) {
    ctx.position += packageMatch[0].length;
    const children = parseBlock(ctx);
    return { name: packageMatch[1]!, type: "package", children };
  }

  // Part def
  const partDefMatch = remaining.match(/^part\s+def\s+(\w+)(?:\s*:>\s*\w+)?\s*\{/);
  if (partDefMatch) {
    ctx.position += partDefMatch[0].length;
    const children = parseBlock(ctx);
    return { name: partDefMatch[1]!, type: "part-def", children };
  }

  // Part def without block
  const partDefSimpleMatch = remaining.match(/^part\s+def\s+(\w+)(?:\s*:>\s*\w+)?\s*;/);
  if (partDefSimpleMatch) {
    ctx.position += partDefSimpleMatch[0].length;
    return { name: partDefSimpleMatch[1]!, type: "part-def", children: [] };
  }

  // Part usage with block
  const partMatch = remaining.match(/^part\s+(\w+)(?:\s*:\s*\w+)?(?:\s*\[[^\]]*\])?\s*\{/);
  if (partMatch) {
    ctx.position += partMatch[0].length;
    const children = parseBlock(ctx);
    return { name: partMatch[1]!, type: "part", children };
  }

  // Part usage without block
  const partSimpleMatch = remaining.match(/^part\s+(\w+)(?:\s*:\s*\w+)?(?:\s*\[[^\]]*\])?\s*;/);
  if (partSimpleMatch) {
    ctx.position += partSimpleMatch[0].length;
    return { name: partSimpleMatch[1]!, type: "part", children: [] };
  }

  // Port def
  const portDefMatch = remaining.match(/^port\s+def\s+(\w+)\s*\{/);
  if (portDefMatch) {
    ctx.position += portDefMatch[0].length;
    const children = parseBlock(ctx);
    return { name: portDefMatch[1]!, type: "port-def", children };
  }

  // Port def without block
  const portDefSimpleMatch = remaining.match(/^port\s+def\s+(\w+)\s*;/);
  if (portDefSimpleMatch) {
    ctx.position += portDefSimpleMatch[0].length;
    return { name: portDefSimpleMatch[1]!, type: "port-def", children: [] };
  }

  // Port usage
  const portMatch = remaining.match(/^(?:in|out|inout)?\s*port\s+(\w+)(?:\s*:\s*\w+)?\s*;/);
  if (portMatch) {
    ctx.position += portMatch[0].length;
    return { name: portMatch[1]!, type: "port", children: [] };
  }

  // Action def
  const actionDefMatch = remaining.match(/^action\s+def\s+(\w+)(?:\s*:>\s*\w+)?\s*\{/);
  if (actionDefMatch) {
    ctx.position += actionDefMatch[0].length;
    const children = parseBlock(ctx);
    return { name: actionDefMatch[1]!, type: "action-def", children };
  }

  // Action def without block
  const actionDefSimpleMatch = remaining.match(/^action\s+def\s+(\w+)(?:\s*:>\s*\w+)?\s*;/);
  if (actionDefSimpleMatch) {
    ctx.position += actionDefSimpleMatch[0].length;
    return { name: actionDefSimpleMatch[1]!, type: "action-def", children: [] };
  }

  // Action usage
  const actionMatch = remaining.match(/^action\s+(\w+)(?:\s*:\s*\w+)?\s*;/);
  if (actionMatch) {
    ctx.position += actionMatch[0].length;
    return { name: actionMatch[1]!, type: "action", children: [] };
  }

  // State def
  const stateDefMatch = remaining.match(/^state\s+def\s+(\w+)(?:\s*:>\s*\w+)?\s*\{/);
  if (stateDefMatch) {
    ctx.position += stateDefMatch[0].length;
    const children = parseBlock(ctx);
    return { name: stateDefMatch[1]!, type: "state-def", children };
  }

  // State usage with block
  const stateMatch = remaining.match(/^state\s+(\w+)(?:\s*:\s*\w+)?\s*\{/);
  if (stateMatch) {
    ctx.position += stateMatch[0].length;
    const children = parseBlock(ctx);
    return { name: stateMatch[1]!, type: "state", children };
  }

  // State usage without block
  const stateSimpleMatch = remaining.match(/^state\s+(\w+)(?:\s*:\s*\w+)?\s*;/);
  if (stateSimpleMatch) {
    ctx.position += stateSimpleMatch[0].length;
    return { name: stateSimpleMatch[1]!, type: "state", children: [] };
  }

  // Requirement def
  const reqDefMatch = remaining.match(/^requirement\s+def\s+(?:<'[^']*'>\s*)?(\w+)(?:\s*:>\s*\w+)?\s*\{/);
  if (reqDefMatch) {
    ctx.position += reqDefMatch[0].length;
    const children = parseBlock(ctx);
    return { name: reqDefMatch[1]!, type: "requirement-def", children };
  }

  // Requirement def without block
  const reqDefSimpleMatch = remaining.match(/^requirement\s+def\s+(?:<'[^']*'>\s*)?(\w+)(?:\s*:>\s*\w+)?\s*;/);
  if (reqDefSimpleMatch) {
    ctx.position += reqDefSimpleMatch[0].length;
    return { name: reqDefSimpleMatch[1]!, type: "requirement-def", children: [] };
  }

  // Requirement usage
  const reqMatch = remaining.match(/^requirement\s+(?:<'[^']*'>\s*)?(\w+)(?:\s*:\s*\w+)?\s*;/);
  if (reqMatch) {
    ctx.position += reqMatch[0].length;
    return { name: reqMatch[1]!, type: "requirement", children: [] };
  }

  // Attribute
  const attrMatch = remaining.match(/^attribute\s+(\w+)(?:\s*:\s*\w+)?(?:\s*=\s*[^;]+)?\s*;/);
  if (attrMatch) {
    ctx.position += attrMatch[0].length;
    return { name: attrMatch[1]!, type: "attribute", children: [] };
  }

  // Item def
  const itemDefMatch = remaining.match(/^item\s+def\s+(\w+)(?:\s*:>\s*\w+)?\s*\{/);
  if (itemDefMatch) {
    ctx.position += itemDefMatch[0].length;
    const children = parseBlock(ctx);
    return { name: itemDefMatch[1]!, type: "item-def", children };
  }

  // Item def without block
  const itemDefSimpleMatch = remaining.match(/^item\s+def\s+(\w+)(?:\s*:>\s*\w+)?\s*;/);
  if (itemDefSimpleMatch) {
    ctx.position += itemDefSimpleMatch[0].length;
    return { name: itemDefSimpleMatch[1]!, type: "item-def", children: [] };
  }

  // Item usage
  const itemMatch = remaining.match(/^item\s+(\w+)(?:\s*:\s*\w+)?\s*;/);
  if (itemMatch) {
    ctx.position += itemMatch[0].length;
    return { name: itemMatch[1]!, type: "item", children: [] };
  }

  // Connection
  const connectMatch = remaining.match(/^connect\s+(?:(\w+)\s+)?[^;]+;/);
  if (connectMatch) {
    ctx.position += connectMatch[0].length;
    return { name: connectMatch[1] || "anonymous", type: "connection", children: [] };
  }

  // Skip unknown content until next recognizable element or closing brace
  const skipMatch = remaining.match(/^[^{}]+?(?=[{}]|package|part|port|action|state|requirement|attribute|item|connect|$)/);
  if (skipMatch && skipMatch[0].length > 0) {
    ctx.position += skipMatch[0].length;
    return null;
  }

  // Skip single character if stuck; always advance to avoid infinite loops
  ctx.position = Math.min(ctx.position + 1, ctx.content.length);

  return null;
}

export function buildStructureTree(model: string): StructureNode {
  const cleanedModel = removeComments(model);
  const ctx: ParseContext = { content: cleanedModel, position: 0 };

  const children = parseBlock(ctx);

  return {
    name: "root",
    type: "package",
    children,
  };
}

function getNodePath(ancestors: string[], name: string): string {
  return [...ancestors, name].join("/");
}

function collectNodes(
  node: StructureNode,
  ancestors: string[] = []
): Map<string, { node: StructureNode; path: string }> {
  const result = new Map<string, { node: StructureNode; path: string }>();
  const path = getNodePath(ancestors, node.name);

  if (node.name !== "root") {
    result.set(`${node.type}:${node.name}`, { node, path });
  }

  for (const child of node.children) {
    const childNodes = collectNodes(child, node.name === "root" ? [] : [...ancestors, node.name]);
    for (const [key, value] of childNodes) {
      result.set(key, value);
    }
  }

  return result;
}

export function compareTrees(expected: StructureNode, actual: StructureNode): TreeComparisonResult {
  const expectedNodes = collectNodes(expected);
  const actualNodes = collectNodes(actual);

  const matched: MatchedNode[] = [];
  const missing: MissingNode[] = [];
  const extra: ExtraNode[] = [];
  const misplaced: MisplacedNode[] = [];

  // Check each expected node
  for (const [key, expectedInfo] of expectedNodes) {
    const actualInfo = actualNodes.get(key);

    if (!actualInfo) {
      // Node is missing
      const [type, name] = key.split(":") as [StructureNodeType, string];
      missing.push({
        name,
        type,
        expectedPath: expectedInfo.path,
      });
    } else if (actualInfo.path !== expectedInfo.path) {
      // Node exists but in different location
      const [type, name] = key.split(":") as [StructureNodeType, string];
      misplaced.push({
        name,
        type,
        expectedPath: expectedInfo.path,
        actualPath: actualInfo.path,
      });
    } else {
      // Node matches
      matched.push({
        name: expectedInfo.node.name,
        type: expectedInfo.node.type,
        path: expectedInfo.path,
      });
    }
  }

  // Check for extra nodes in actual
  for (const [key, actualInfo] of actualNodes) {
    if (!expectedNodes.has(key)) {
      const [type, name] = key.split(":") as [StructureNodeType, string];
      extra.push({
        name,
        type,
        actualPath: actualInfo.path,
      });
    }
  }

  const totalExpected = expectedNodes.size;
  const matchedCount = matched.length;
  const score = totalExpected > 0 ? matchedCount / totalExpected : 1;

  return {
    match: missing.length === 0 && misplaced.length === 0 && extra.length === 0,
    score,
    matched,
    missing,
    extra,
    misplaced,
  };
}

export function compareStructures(expectedModel: string, actualModel: string): TreeComparisonResult {
  const expectedTree = buildStructureTree(expectedModel);
  const actualTree = buildStructureTree(actualModel);
  return compareTrees(expectedTree, actualTree);
}
