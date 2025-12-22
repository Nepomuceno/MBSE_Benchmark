/**
 * SysML v2 Syntax Validator
 *
 * Validates that text output is syntactically valid SysML v2.
 */

export interface SyntaxError {
  line: number;
  column: number;
  message: string;
  severity: "error" | "warning";
}

export interface SysmlValidationResult {
  valid: boolean;
  errors: SyntaxError[];
  warnings: SyntaxError[];
  elements: {
    packages: number;
    partDefs: number;
    parts: number;
    portDefs: number;
    ports: number;
    actions: number;
    states: number;
    requirements: number;
  };
}

export const SYSML_V2_KEYWORDS = [
  "package",
  "part",
  "part def",
  "port",
  "port def",
  "attribute",
  "attribute def",
  "item",
  "item def",
  "action",
  "action def",
  "state",
  "state def",
  "requirement",
  "requirement def",
  "constraint",
  "constraint def",
  "interface",
  "interface def",
  "connection",
  "connection def",
  "import",
  "alias",
  "in",
  "out",
  "inout",
  "specializes",
  "subsets",
  "redefines",
  "ref",
  "connect",
  "bind",
  "flow",
  "stream",
  "message",
  "transition",
  "accept",
  "then",
  "first",
  "entry",
  "exit",
  "do",
  "calc",
  "calc def",
  "analysis",
  "case",
  "use case",
  "variation",
  "variant",
  "abstract",
  "individual",
  "assert",
  "assume",
  "require",
  "satisfy",
  "doc",
  "comment",
  "about",
  "allocation",
  "allocation def",
  "exhibit",
  "expose",
  "perform",
  "send",
  "rendering",
  "rendering def",
  "view",
  "view def",
  "viewpoint",
  "viewpoint def",
  "concern",
  "concern def",
  "stakeholder",
  "metadata",
  "metadata def",
  "occurrence",
  "occurrence def",
  "succession",
  "if",
  "else",
  "while",
  "loop",
  "for",
  "merge",
  "decide",
  "join",
  "fork",
  "filter",
] as const;

const SYSML_V2_KEYWORD_SET = new Set(SYSML_V2_KEYWORDS);

interface BraceInfo {
  char: "{" | "}" | "(" | ")" | "[" | "]";
  line: number;
  column: number;
}

function validateBraceMatching(input: string): SyntaxError[] {
  const errors: SyntaxError[] = [];
  const stack: BraceInfo[] = [];
  const lines = input.split("\n");

  const matchingBrace: Record<string, string> = {
    "{": "}",
    "(": ")",
    "[": "]",
  };

  const openingBraces = new Set(["{", "(", "["]);
  const closingBraces: Record<string, string> = {
    "}": "{",
    ")": "(",
    "]": "[",
  };

  let inString = false;
  let inBlockComment = false;
  let stringChar = "";

  for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
    const line = lines[lineIndex]!;

    for (let col = 0; col < line.length; col++) {
      const char = line[col]!;
      const nextChar = line[col + 1] ?? "";

      // Handle block comments
      if (!inString && char === "/" && nextChar === "*") {
        inBlockComment = true;
        col++;
        continue;
      }
      if (inBlockComment && char === "*" && nextChar === "/") {
        inBlockComment = false;
        col++;
        continue;
      }
      if (inBlockComment) continue;

      // Handle line comments
      if (!inString && char === "/" && nextChar === "/") {
        break;
      }

      // Handle strings - count consecutive backslashes to determine if quote is escaped
      if (char === '"' || char === "'") {
        let backslashCount = 0;
        for (let i = col - 1; i >= 0 && line[i] === "\\"; i--) {
          backslashCount++;
        }
        const isEscaped = backslashCount % 2 === 1;

        if (!isEscaped) {
          if (!inString) {
            inString = true;
            stringChar = char;
          } else if (char === stringChar) {
            inString = false;
          }
        }
        continue;
      }
      if (inString) continue;

      // Check braces
      if (openingBraces.has(char)) {
        stack.push({
          char: char as "{" | "(" | "[",
          line: lineIndex + 1,
          column: col + 1,
        });
      } else if (char in closingBraces) {
        if (stack.length === 0) {
          errors.push({
            line: lineIndex + 1,
            column: col + 1,
            message: `Unexpected closing '${char}' without matching opening brace`,
            severity: "error",
          });
        } else {
          const last = stack.pop()!;
          const expected = matchingBrace[last.char];
          if (char !== expected) {
            errors.push({
              line: lineIndex + 1,
              column: col + 1,
              message: `Mismatched brace: expected '${expected}' but found '${char}'`,
              severity: "error",
            });
          }
        }
      }
    }
  }

  // Check for unclosed braces
  for (const unclosed of stack) {
    errors.push({
      line: unclosed.line,
      column: unclosed.column,
      message: `Unclosed '${unclosed.char}'`,
      severity: "error",
    });
  }

  return errors;
}

function validateKeywords(input: string): SyntaxError[] {
  const errors: SyntaxError[] = [];
  const lines = input.split("\n");

  // Pattern to find potential definitions that look like SysML but use wrong keywords
  // This looks for word followed by word followed by { or word
  const defPattern = /^\s*(\w+(?:\s+\w+)?)\s+(\w+)\s*(?:\{|:>|;)/;

  // Known valid definition starters
  const validDefStarters = new Set([
    "package",
    "part def",
    "part",
    "port def",
    "port",
    "attribute def",
    "attribute",
    "item def",
    "item",
    "action def",
    "action",
    "state def",
    "state",
    "requirement def",
    "requirement",
    "constraint def",
    "constraint",
    "interface def",
    "interface",
    "connection def",
    "connection",
    "calc def",
    "calc",
    "use case",
    "case",
    "variation",
    "variant",
    "abstract",
    "individual",
    "allocation def",
    "allocation",
    "view def",
    "view",
    "viewpoint def",
    "viewpoint",
    "rendering def",
    "rendering",
    "concern def",
    "concern",
    "stakeholder",
    "occurrence def",
    "occurrence",
    "metadata def",
    "metadata",
    "import",
    "alias",
    "comment",
    "doc",
    "ref",
    "exhibit",
    "perform",
    "assert",
    "assume",
    "satisfy",
    "expose",
    "bind",
    "connect",
    "flow",
    "succession",
    "transition",
    "accept",
    "send",
    "if",
    "else",
    "while",
    "loop",
    "for",
    "merge",
    "decide",
    "join",
    "fork",
    "filter",
    "entry",
    "exit",
    "do",
    "first",
    "then",
  ]);

  let inBlockComment = false;

  for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
    const line = lines[lineIndex]!;

    // Skip block comments
    if (line.includes("/*")) inBlockComment = true;
    if (line.includes("*/")) {
      inBlockComment = false;
      continue;
    }
    if (inBlockComment) continue;

    // Skip line comments
    const commentIndex = line.indexOf("//");
    const effectiveLine = commentIndex >= 0 ? line.slice(0, commentIndex) : line;

    // Skip empty lines and pure string lines
    if (effectiveLine.trim().length === 0) continue;

    const match = effectiveLine.match(defPattern);
    if (match && match[1]) {
      const keyword = match[1].toLowerCase();
      // Check if it looks like a definition but uses an unknown keyword
      if (!validDefStarters.has(keyword) && !SYSML_V2_KEYWORD_SET.has(keyword as typeof SYSML_V2_KEYWORDS[number])) {
        // Only flag if it looks like a definition attempt (has structure)
        if (effectiveLine.includes("{") || effectiveLine.includes(":>")) {
          errors.push({
            line: lineIndex + 1,
            column: effectiveLine.indexOf(match[1]) + 1,
            message: `Unknown keyword or definition type: '${match[1]}'`,
            severity: "warning",
          });
        }
      }
    }
  }

  return errors;
}

function validateStructure(input: string): SyntaxError[] {
  const errors: SyntaxError[] = [];
  const lines = input.split("\n");

  // Check for common structural issues
  let inBlockComment = false;

  for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
    const line = lines[lineIndex]!;

    // Handle block comments
    if (line.includes("/*")) inBlockComment = true;
    if (line.includes("*/")) {
      inBlockComment = false;
      continue;
    }
    if (inBlockComment) continue;

    // Skip line comments
    const commentIndex = line.indexOf("//");
    const effectiveLine = commentIndex >= 0 ? line.slice(0, commentIndex) : line;

    // Check for semicolon issues (statement without semicolon or brace)
    // Look for lines that look like attribute declarations
    const attrMatch = effectiveLine.match(/^\s*attribute\s+\w+\s*(?::\s*\w+)?([^;{}]*)$/);
    if (attrMatch && effectiveLine.trim().length > 0 && !effectiveLine.trim().endsWith("{")) {
      const trimmed = effectiveLine.trim();
      if (!trimmed.endsWith(";") && !trimmed.endsWith("{") && !trimmed.endsWith("}")) {
        errors.push({
          line: lineIndex + 1,
          column: effectiveLine.length,
          message: "Statement may be missing semicolon",
          severity: "warning",
        });
      }
    }

    // Check for import syntax
    const importMatch = effectiveLine.match(/^\s*import\s+(.+)$/);
    if (importMatch && importMatch[1]) {
      const importPath = importMatch[1].trim();
      if (!importPath.endsWith(";")) {
        errors.push({
          line: lineIndex + 1,
          column: effectiveLine.length,
          message: "Import statement must end with semicolon",
          severity: "error",
        });
      }
      // Check for valid import syntax (should have :: or be *)
      if (!importPath.includes("::") && !importPath.startsWith("*")) {
        errors.push({
          line: lineIndex + 1,
          column: effectiveLine.indexOf("import") + 1,
          message: "Import path should use '::' separator",
          severity: "warning",
        });
      }
    }
  }

  return errors;
}

function countElements(input: string): SysmlValidationResult["elements"] {
  const counts = {
    packages: 0,
    partDefs: 0,
    parts: 0,
    portDefs: 0,
    ports: 0,
    actions: 0,
    states: 0,
    requirements: 0,
  };

  // Remove comments before counting
  const noComments = input
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/\/\/.*$/gm, "");

  // Count each element type
  counts.packages = (noComments.match(/\bpackage\s+\w+/g) || []).length;
  counts.partDefs = (noComments.match(/\bpart\s+def\s+\w+/g) || []).length;
  counts.parts = (noComments.match(/\bpart\s+(?!def\b)\w+/g) || []).length;
  counts.portDefs = (noComments.match(/\bport\s+def\s+\w+/g) || []).length;
  counts.ports = (noComments.match(/\bport\s+(?!def\b)\w+/g) || []).length;
  counts.actions = (noComments.match(/\b(?:action\s+def|action)\s+\w+/g) || []).length;
  counts.states = (noComments.match(/\b(?:state\s+def|state)\s+\w+/g) || []).length;
  counts.requirements = (noComments.match(/\b(?:requirement\s+def|requirement)\s+\w+/g) || []).length;

  return counts;
}

export function validateSysmlSyntax(input: string): SysmlValidationResult {
  const braceErrors = validateBraceMatching(input);
  const keywordErrors = validateKeywords(input);
  const structureErrors = validateStructure(input);

  const allIssues = [...braceErrors, ...keywordErrors, ...structureErrors];
  const errors = allIssues.filter((e) => e.severity === "error");
  const warnings = allIssues.filter((e) => e.severity === "warning");

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    elements: countElements(input),
  };
}

export function isValidSysmlSyntax(input: string): boolean {
  return validateSysmlSyntax(input).valid;
}
