/**
 * SysML v2 Component Extractor
 *
 * Extracts structured information from SysML v2 models for comparison.
 */

export interface PackageInfo {
  name: string;
  imports: string[];
}

export interface PartDefInfo {
  name: string;
  parent?: string;
  attributes: string[];
  ports: string[];
  actions: string[];
  parts: string[];
}

export interface PartInfo {
  name: string;
  type?: string;
  multiplicity?: string;
}

export interface PortDefInfo {
  name: string;
  direction?: "in" | "out" | "inout";
  attributes: string[];
}

export interface PortInfo {
  name: string;
  type?: string;
  direction?: "in" | "out" | "inout";
}

export interface AttributeInfo {
  name: string;
  type?: string;
  defaultValue?: string;
}

export interface ConnectionInfo {
  name?: string;
  source: string;
  target: string;
}

export interface RequirementInfo {
  name: string;
  id?: string;
  text?: string;
  parent?: string;
}

export interface StateInfo {
  name: string;
  isInitial?: boolean;
  parent?: string;
  entryAction?: string;
  exitAction?: string;
  doAction?: string;
}

export interface TransitionInfo {
  name?: string;
  source: string;
  target: string;
  trigger?: string;
  guard?: string;
}

export interface ActionInfo {
  name: string;
  parent?: string;
  inputs: string[];
  outputs: string[];
}

export interface ExtractedModel {
  packages: PackageInfo[];
  partDefs: PartDefInfo[];
  parts: PartInfo[];
  portDefs: PortDefInfo[];
  ports: PortInfo[];
  attributes: AttributeInfo[];
  connections: ConnectionInfo[];
  requirements: RequirementInfo[];
  states: StateInfo[];
  transitions: TransitionInfo[];
  actions: ActionInfo[];
}

function removeComments(input: string): string {
  return input.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/gm, "");
}

function findMatchingBrace(content: string, startIndex: number): number {
  let braceCount = 1;
  let endIndex = startIndex;
  let inString = false;
  let stringDelimiter: string | null = null;
  let escape = false;

  while (braceCount > 0 && endIndex < content.length) {
    const ch = content[endIndex];

    if (inString) {
      if (escape) {
        escape = false;
      } else if (ch === "\\") {
        escape = true;
      } else if (ch === stringDelimiter) {
        inString = false;
        stringDelimiter = null;
      }
    } else {
      if (ch === '"' || ch === "'" || ch === "`") {
        inString = true;
        stringDelimiter = ch;
        escape = false;
      } else if (ch === "{") {
        braceCount++;
      } else if (ch === "}") {
        braceCount--;
      }
    }
    endIndex++;
  }

  return endIndex;
}

function extractPackages(input: string): PackageInfo[] {
  const packages: PackageInfo[] = [];
  const noComments = removeComments(input);

  // Match package declarations
  const packagePattern = /\bpackage\s+(\w+)\s*\{/g;
  let match;

  while ((match = packagePattern.exec(noComments)) !== null) {
    const name = match[1];
    const startIndex = match.index;

    // Find the content of this package using string-aware brace matching
    const contentStart = startIndex + match[0].length;
    const endIndex = findMatchingBrace(noComments, contentStart);

    const packageContent = noComments.slice(contentStart, endIndex - 1);

    // Extract imports from this package
    const imports: string[] = [];
    const importPattern = /\bimport\s+([^;]+);/g;
    let importMatch;
    while ((importMatch = importPattern.exec(packageContent)) !== null) {
      if (importMatch[1]) imports.push(importMatch[1].trim());
    }

    if (name) packages.push({ name, imports });
  }

  return packages;
}

function extractPartDefs(input: string): PartDefInfo[] {
  const partDefs: PartDefInfo[] = [];
  const noComments = removeComments(input);

  // Match part def declarations
  const partDefPattern = /\bpart\s+def\s+(\w+)(?:\s*:>\s*(\w+))?\s*\{?/g;
  let match;

  while ((match = partDefPattern.exec(noComments)) !== null) {
    const name = match[1];
    if (!name) continue;
    const parent = match[2];

    const info: PartDefInfo = {
      name,
      parent,
      attributes: [],
      ports: [],
      actions: [],
      parts: [],
    };

    // If there's a block, extract contents
    if (match[0].includes("{")) {
      const startIndex = match.index + match[0].length;
      let braceCount = 1;
      let endIndex = startIndex;
      while (braceCount > 0 && endIndex < noComments.length) {
        if (noComments[endIndex] === "{") braceCount++;
        if (noComments[endIndex] === "}") braceCount--;
        endIndex++;
      }

      const content = noComments.slice(startIndex, endIndex - 1);

      // Extract attributes
      const attrPattern = /\battribute\s+(\w+)/g;
      let attrMatch;
      while ((attrMatch = attrPattern.exec(content)) !== null) {
        if (attrMatch[1]) info.attributes.push(attrMatch[1]);
      }

      // Extract ports
      const portPattern = /\bport\s+(?!def\b)(\w+)/g;
      let portMatch;
      while ((portMatch = portPattern.exec(content)) !== null) {
        if (portMatch[1]) info.ports.push(portMatch[1]);
      }

      // Extract nested parts
      const nestedPartPattern = /\bpart\s+(?!def\b)(\w+)/g;
      let nestedMatch;
      while ((nestedMatch = nestedPartPattern.exec(content)) !== null) {
        if (nestedMatch[1]) info.parts.push(nestedMatch[1]);
      }

      // Extract actions
      const actionPattern = /\b(?:action|perform)\s+(?!def\b)(\w+)/g;
      let actionMatch;
      while ((actionMatch = actionPattern.exec(content)) !== null) {
        if (actionMatch[1]) info.actions.push(actionMatch[1]);
      }
    }

    partDefs.push(info);
  }

  return partDefs;
}

function extractParts(input: string): PartInfo[] {
  const parts: PartInfo[] = [];
  const noComments = removeComments(input);

  // Match part usages (not definitions)
  const partPattern = /\bpart\s+(?!def\b)(\w+)\s*(?::\s*(\w+))?(?:\s*\[([^\]]+)\])?/g;
  let match;

  while ((match = partPattern.exec(noComments)) !== null) {
    if (!match[1]) continue;
    parts.push({
      name: match[1],
      type: match[2],
      multiplicity: match[3],
    });
  }

  return parts;
}

function extractPortDefs(input: string): PortDefInfo[] {
  const portDefs: PortDefInfo[] = [];
  const noComments = removeComments(input);

  const portDefPattern = /\bport\s+def\s+(\w+)\s*\{?/g;
  let match;

  while ((match = portDefPattern.exec(noComments)) !== null) {
    const name = match[1];
    if (!name) continue;
    const info: PortDefInfo = {
      name,
      attributes: [],
    };

    // If there's a block, extract contents
    if (match[0].includes("{")) {
      const startIndex = match.index + match[0].length;
      let braceCount = 1;
      let endIndex = startIndex;
      while (braceCount > 0 && endIndex < noComments.length) {
        if (noComments[endIndex] === "{") braceCount++;
        if (noComments[endIndex] === "}") braceCount--;
        endIndex++;
      }

      const content = noComments.slice(startIndex, endIndex - 1);

      // Check for direction
      if (content.includes("in ") || content.match(/^\s*in\s/m)) {
        info.direction = "in";
      } else if (content.includes("out ") || content.match(/^\s*out\s/m)) {
        info.direction = "out";
      } else if (content.includes("inout ") || content.match(/^\s*inout\s/m)) {
        info.direction = "inout";
      }

      // Extract attributes
      const attrPattern = /\battribute\s+(\w+)/g;
      let attrMatch;
      while ((attrMatch = attrPattern.exec(content)) !== null) {
        if (attrMatch[1]) info.attributes.push(attrMatch[1]);
      }
    }

    portDefs.push(info);
  }

  return portDefs;
}

function extractPorts(input: string): PortInfo[] {
  const ports: PortInfo[] = [];
  const noComments = removeComments(input);

  // Match port usages with optional direction
  const portPattern = /\b(in|out|inout)?\s*port\s+(?!def\b)(\w+)(?:\s*:\s*(\w+))?/g;
  let match;

  while ((match = portPattern.exec(noComments)) !== null) {
    if (!match[2]) continue;
    ports.push({
      name: match[2],
      type: match[3],
      direction: match[1] as "in" | "out" | "inout" | undefined,
    });
  }

  return ports;
}

function extractAttributes(input: string): AttributeInfo[] {
  const attributes: AttributeInfo[] = [];
  const noComments = removeComments(input);

  // Match attribute declarations
  const attrPattern = /\battribute\s+(\w+)(?:\s*:\s*(\w+))?(?:\s*=\s*([^;{]+))?/g;
  let match;

  while ((match = attrPattern.exec(noComments)) !== null) {
    if (!match[1]) continue;
    attributes.push({
      name: match[1],
      type: match[2],
      defaultValue: match[3]?.trim(),
    });
  }

  return attributes;
}

function extractConnections(input: string): ConnectionInfo[] {
  const connections: ConnectionInfo[] = [];
  const noComments = removeComments(input);

  // Match connection patterns
  const connectPattern = /\bconnect\s+(?:(\w+)\s+)?(\S+)\s+to\s+(\S+)/g;
  let match;

  while ((match = connectPattern.exec(noComments)) !== null) {
    if (!match[2] || !match[3]) continue;
    connections.push({
      name: match[1],
      source: match[2],
      target: match[3].replace(/;$/, ""),
    });
  }

  // Also match binding connectors
  const bindPattern = /\bbind\s+(\S+)\s*=\s*(\S+)/g;
  while ((match = bindPattern.exec(noComments)) !== null) {
    if (!match[1] || !match[2]) continue;
    connections.push({
      source: match[1],
      target: match[2].replace(/;$/, ""),
    });
  }

  return connections;
}

function extractRequirements(input: string): RequirementInfo[] {
  const requirements: RequirementInfo[] = [];
  const noComments = removeComments(input);

  // Match requirement definitions and usages
  const reqPattern = /\brequirement\s+(?:def\s+)?(?:<'([^']+)'>\s+)?(\w+)(?:\s*:>\s*(\w+))?\s*\{?/g;
  let match;

  while ((match = reqPattern.exec(noComments)) !== null) {
    if (!match[2]) continue;
    const info: RequirementInfo = {
      name: match[2],
      id: match[1],
      parent: match[3],
    };

    // If there's a block, try to extract the text
    if (match[0].includes("{")) {
      const startIndex = match.index + match[0].length;
      let braceCount = 1;
      let endIndex = startIndex;
      while (braceCount > 0 && endIndex < noComments.length) {
        if (noComments[endIndex] === "{") braceCount++;
        if (noComments[endIndex] === "}") braceCount--;
        endIndex++;
      }

      const content = noComments.slice(startIndex, endIndex - 1);

      // Look for doc or text
      const textMatch = content.match(/\bdoc\s*\/\*\s*([\s\S]*?)\s*\*\//);
      if (textMatch?.[1]) {
        info.text = textMatch[1].trim();
      }
    }

    requirements.push(info);
  }

  return requirements;
}

function extractStates(input: string): StateInfo[] {
  const states: StateInfo[] = [];
  const noComments = removeComments(input);

  // Match state definitions and usages
  const statePattern = /\bstate\s+(?:def\s+)?(\w+)(?:\s*:>\s*(\w+))?\s*\{?/g;
  let match;

  while ((match = statePattern.exec(noComments)) !== null) {
    if (!match[1]) continue;
    const info: StateInfo = {
      name: match[1],
      parent: match[2],
    };

    // If there's a block, check for entry/exit/do actions
    if (match[0].includes("{")) {
      const startIndex = match.index + match[0].length;
      let braceCount = 1;
      let endIndex = startIndex;
      while (braceCount > 0 && endIndex < noComments.length) {
        if (noComments[endIndex] === "{") braceCount++;
        if (noComments[endIndex] === "}") braceCount--;
        endIndex++;
      }

      const content = noComments.slice(startIndex, endIndex - 1);

      const entryMatch = content.match(/\bentry\s+(\w+)/);
      if (entryMatch?.[1]) info.entryAction = entryMatch[1];

      const exitMatch = content.match(/\bexit\s+(\w+)/);
      if (exitMatch?.[1]) info.exitAction = exitMatch[1];

      const doMatch = content.match(/\bdo\s+(\w+)/);
      if (doMatch?.[1]) info.doAction = doMatch[1];
    }

    states.push(info);
  }

  return states;
}

function extractTransitions(input: string): TransitionInfo[] {
  const transitions: TransitionInfo[] = [];
  const noComments = removeComments(input);

  // Match transition patterns
  const transPattern = /\btransition\s+(?:(\w+)\s+)?(?:first\s+)?(\w+)\s+(?:accept\s+(\w+)\s+)?then\s+(\w+)/g;
  let match;

  while ((match = transPattern.exec(noComments)) !== null) {
    if (!match[2] || !match[4]) continue;
    transitions.push({
      name: match[1],
      source: match[2],
      trigger: match[3],
      target: match[4],
    });
  }

  // Also match simple succession
  const succPattern = /\bsuccession\s+(\w+)\s+then\s+(\w+)/g;
  while ((match = succPattern.exec(noComments)) !== null) {
    if (!match[1] || !match[2]) continue;
    transitions.push({
      source: match[1],
      target: match[2],
    });
  }

  return transitions;
}

function extractActions(input: string): ActionInfo[] {
  const actions: ActionInfo[] = [];
  const noComments = removeComments(input);

  // Match action definitions and usages
  const actionPattern = /\baction\s+(?:def\s+)?(\w+)(?:\s*:>\s*(\w+))?\s*\{?/g;
  let match;

  while ((match = actionPattern.exec(noComments)) !== null) {
    if (!match[1]) continue;
    const info: ActionInfo = {
      name: match[1],
      parent: match[2],
      inputs: [],
      outputs: [],
    };

    // If there's a block, extract inputs and outputs
    if (match[0].includes("{")) {
      const startIndex = match.index + match[0].length;
      let braceCount = 1;
      let endIndex = startIndex;
      while (braceCount > 0 && endIndex < noComments.length) {
        if (noComments[endIndex] === "{") braceCount++;
        if (noComments[endIndex] === "}") braceCount--;
        endIndex++;
      }

      const content = noComments.slice(startIndex, endIndex - 1);

      // Extract in/out parameters
      const inPattern = /\bin\s+(\w+)/g;
      let inMatch;
      while ((inMatch = inPattern.exec(content)) !== null) {
        if (inMatch[1]) info.inputs.push(inMatch[1]);
      }

      const outPattern = /\bout\s+(\w+)/g;
      let outMatch;
      while ((outMatch = outPattern.exec(content)) !== null) {
        if (outMatch[1]) info.outputs.push(outMatch[1]);
      }
    }

    actions.push(info);
  }

  return actions;
}

export function extractSysmlComponents(input: string): ExtractedModel {
  return {
    packages: extractPackages(input),
    partDefs: extractPartDefs(input),
    parts: extractParts(input),
    portDefs: extractPortDefs(input),
    ports: extractPorts(input),
    attributes: extractAttributes(input),
    connections: extractConnections(input),
    requirements: extractRequirements(input),
    states: extractStates(input),
    transitions: extractTransitions(input),
    actions: extractActions(input),
  };
}

export interface CompareOptions {
  ignoreCase?: boolean;
  ignoreOrder?: boolean;
  fuzzyMatch?: boolean;
}

export interface ComparisonResult {
  matchRatio: number;
  matched: string[];
  missing: string[];
  extra: string[];
  details: Record<string, { expected: number; actual: number; matched: number }>;
}

export function compareExtracted(
  expected: ExtractedModel,
  actual: ExtractedModel,
  _options: CompareOptions = {}
): ComparisonResult {
  const matched: string[] = [];
  const missing: string[] = [];
  const extra: string[] = [];
  const details: Record<string, { expected: number; actual: number; matched: number }> = {};

  // Compare each category
  const categories: (keyof ExtractedModel)[] = [
    "packages",
    "partDefs",
    "parts",
    "portDefs",
    "ports",
    "attributes",
    "connections",
    "requirements",
    "states",
    "transitions",
    "actions",
  ];

  let totalExpected = 0;
  let totalMatched = 0;

  for (const category of categories) {
    const expectedItems = expected[category];
    const actualItems = actual[category];

    const expectedNames = new Set(expectedItems.map((item) => (item as { name: string }).name || JSON.stringify(item)));
    const actualNames = new Set(actualItems.map((item) => (item as { name: string }).name || JSON.stringify(item)));

    let categoryMatched = 0;

    for (const name of expectedNames) {
      if (actualNames.has(name)) {
        matched.push(`${category}:${name}`);
        categoryMatched++;
      } else {
        missing.push(`${category}:${name}`);
      }
    }

    for (const name of actualNames) {
      if (!expectedNames.has(name)) {
        extra.push(`${category}:${name}`);
      }
    }

    details[category] = {
      expected: expectedItems.length,
      actual: actualItems.length,
      matched: categoryMatched,
    };

    totalExpected += expectedItems.length;
    totalMatched += categoryMatched;
  }

  const matchRatio = totalExpected > 0 ? totalMatched / totalExpected : 1;

  return {
    matchRatio,
    matched,
    missing,
    extra,
    details,
  };
}

export function extractPartDefNames(input: string): string[] {
  return extractPartDefs(input).map((p) => p.name);
}

export function extractPortDefNames(input: string): string[] {
  return extractPortDefs(input).map((p) => p.name);
}

export function extractRequirementNames(input: string): string[] {
  return extractRequirements(input).map((r) => r.name);
}

export function extractStateNames(input: string): string[] {
  return extractStates(input).map((s) => s.name);
}

export function extractActionNames(input: string): string[] {
  return extractActions(input).map((a) => a.name);
}
