/**
 * SysML v2 Semantic Comparator (LLM-Assisted)
 *
 * Compares two SysML v2 models for semantic equivalence using LLM assistance.
 * This validator goes beyond syntax and structure to understand if two models
 * express the same concepts, even if structured differently.
 */

import { getModel, createModelClient } from "../../models/index.js";

/**
 * Result of semantic comparison between two SysML v2 models
 */
export interface SemanticComparisonResult {
  /** Whether the models are semantically equivalent */
  equivalent: boolean;
  /** Confidence level 0-1 */
  confidence: number;
  /** List of semantic differences found */
  differences: SemanticDifference[];
  /** Human-readable explanation of the comparison */
  explanation: string;
}

/**
 * A single semantic difference between two models
 */
export interface SemanticDifference {
  /** Element or aspect that differs */
  element: string;
  /** What was expected */
  expected: string;
  /** What was found */
  actual: string;
  /** How significant this difference is */
  significance: "major" | "minor" | "cosmetic";
}

/**
 * Configuration options for semantic comparison
 */
export interface SemanticCompareOptions {
  /** Model ID to use for LLM-assisted comparison */
  modelId?: string;
  /** Maximum tokens for LLM response */
  maxTokens?: number;
  /** Consider as equivalent: different import styles */
  tolerateImportVariations?: boolean;
  /** Consider as equivalent: different naming if documented */
  tolerateNamingVariations?: boolean;
  /** Consider as equivalent: different formatting/whitespace */
  tolerateFormattingVariations?: boolean;
}

const DEFAULT_OPTIONS: SemanticCompareOptions = {
  modelId: "gpt-4o",
  maxTokens: 2000,
  tolerateImportVariations: true,
  tolerateNamingVariations: false,
  tolerateFormattingVariations: true,
};

/**
 * Build the LLM prompt for semantic comparison
 */
function buildSemanticComparisonPrompt(
  expectedModel: string,
  actualModel: string,
  options: SemanticCompareOptions
): string {
  const tolerations: string[] = [];

  if (options.tolerateImportVariations) {
    tolerations.push("- Different import styles (wildcard vs explicit)");
  }
  if (options.tolerateNamingVariations) {
    tolerations.push("- Different naming (if documented with alias or comment)");
  }
  if (options.tolerateFormattingVariations) {
    tolerations.push("- Different formatting/whitespace");
  }

  return `Compare these two SysML v2 models for semantic equivalence.

## Expected Model
\`\`\`sysml
${expectedModel}
\`\`\`

## Actual Model
\`\`\`sysml
${actualModel}
\`\`\`

## Analysis Instructions
1. Do they define the same parts/elements with equivalent attributes?
2. Are relationships equivalent (even if expressed differently)?
3. Are constraints semantically equivalent?
4. Are there any semantic differences that matter for the model's meaning?

## Consider as Equivalent
${tolerations.length > 0 ? tolerations.join("\n") : "- No special tolerations"}

## Consider as Different
- Missing elements or definitions
- Different relationships or hierarchies
- Different constraint logic or expressions
- Different cardinalities or multiplicities
- Different port directions or types

## Response Format
Return ONLY valid JSON in this exact format:
{
  "equivalent": <true or false>,
  "confidence": <0.0 to 1.0>,
  "differences": [
    {
      "element": "<name of element or aspect>",
      "expected": "<what was expected>",
      "actual": "<what was found>",
      "significance": "<major|minor|cosmetic>"
    }
  ],
  "explanation": "<overall explanation of comparison result>"
}`;
}

/**
 * Parse the LLM response into a SemanticComparisonResult
 */
function parseSemanticResponse(text: string): SemanticComparisonResult {
  // Extract JSON from response (handle markdown code blocks)
  let jsonStr = text;
  const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (jsonMatch) {
    jsonStr = jsonMatch[1]!;
  }

  const parsed = JSON.parse(jsonStr.trim()) as {
    equivalent: boolean;
    confidence: number;
    differences: SemanticDifference[];
    explanation: string;
  };

  // Validate and normalize the response
  const result: SemanticComparisonResult = {
    equivalent: Boolean(parsed.equivalent),
    confidence: Math.max(0, Math.min(1, Number(parsed.confidence) || 0)),
    differences: Array.isArray(parsed.differences)
      ? parsed.differences.map((d) => ({
          element: String(d.element || "unknown"),
          expected: String(d.expected || ""),
          actual: String(d.actual || ""),
          significance: validateSignificance(d.significance),
        }))
      : [],
    explanation: String(parsed.explanation || "No explanation provided"),
  };

  return result;
}

/**
 * Validate significance level
 */
function validateSignificance(value: unknown): "major" | "minor" | "cosmetic" {
  if (value === "major" || value === "minor" || value === "cosmetic") {
    return value;
  }
  return "minor";
}

/**
 * Compare two SysML v2 models for semantic equivalence using LLM assistance.
 *
 * @param expectedModel - The expected/reference SysML v2 model
 * @param actualModel - The actual/generated SysML v2 model
 * @param options - Comparison options
 * @returns Promise resolving to semantic comparison result
 */
export async function compareSemantics(
  expectedModel: string,
  actualModel: string,
  options: SemanticCompareOptions = {}
): Promise<SemanticComparisonResult> {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  // Get the model configuration
  const modelConfig = getModel(opts.modelId!);
  if (!modelConfig) {
    return {
      equivalent: false,
      confidence: 0,
      differences: [],
      explanation: `LLM model not found: ${opts.modelId}. Cannot perform semantic comparison.`,
    };
  }

  try {
    const adapter = createModelClient(modelConfig);
    const prompt = buildSemanticComparisonPrompt(expectedModel, actualModel, opts);
    const result = await adapter.generate(prompt, {
      maxTokens: opts.maxTokens,
      systemPrompt:
        "You are an expert in SysML v2 and model-based systems engineering. Analyze models for semantic equivalence and return valid JSON only.",
    });

    return parseSemanticResponse(result.text);
  } catch (error) {
    return {
      equivalent: false,
      confidence: 0,
      differences: [],
      explanation: `Semantic comparison failed: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}

/**
 * Quick check if two models are semantically equivalent (boolean result only).
 *
 * @param expectedModel - The expected/reference SysML v2 model
 * @param actualModel - The actual/generated SysML v2 model
 * @param options - Comparison options
 * @returns Promise resolving to true if models are equivalent
 */
export async function areModelsEquivalent(
  expectedModel: string,
  actualModel: string,
  options: SemanticCompareOptions = {}
): Promise<boolean> {
  const result = await compareSemantics(expectedModel, actualModel, options);
  const confidenceThreshold =
    (options as any).confidenceThreshold != null ? (options as any).confidenceThreshold : 0.7;
  return result.equivalent && result.confidence > confidenceThreshold;
}

/**
 * Compare two models and return a score based on semantic similarity.
 *
 * @param expectedModel - The expected/reference SysML v2 model
 * @param actualModel - The actual/generated SysML v2 model
 * @param options - Comparison options
 * @returns Promise resolving to a score 0-1
 */
export async function getSemanticScore(
  expectedModel: string,
  actualModel: string,
  options: SemanticCompareOptions = {}
): Promise<number> {
  const result = await compareSemantics(expectedModel, actualModel, options);

  if (result.equivalent) {
    return result.confidence;
  }

  // Calculate score based on differences
  const majorCount = result.differences.filter((d) => d.significance === "major").length;
  const minorCount = result.differences.filter((d) => d.significance === "minor").length;
  const cosmeticCount = result.differences.filter((d) => d.significance === "cosmetic").length;

  // Weight: major=0.3, minor=0.1, cosmetic=0.02; cap penalty at 1.0
  const penalty = Math.min(1, majorCount * 0.3 + minorCount * 0.1 + cosmeticCount * 0.02);

  // Return confidence adjusted by penalty, minimum 0
  return Math.max(0, result.confidence * (1 - penalty));
}

/**
 * Perform semantic comparison without LLM (rule-based fallback).
 * This is a simpler comparison that can be used when LLM is not available.
 *
 * @param expectedModel - The expected/reference SysML v2 model
 * @param actualModel - The actual/generated SysML v2 model
 * @returns Semantic comparison result (less accurate than LLM-assisted)
 */
export function compareSemanticsSync(
  expectedModel: string,
  actualModel: string
): SemanticComparisonResult {
  // Import extractors for rule-based comparison
  // This is a synchronous fallback that uses structural comparison

  const differences: SemanticDifference[] = [];

  // Normalize models for comparison
  const normalizeModel = (model: string): string => {
    return model
      .replace(/\/\*[\s\S]*?\*\//g, "") // Remove block comments
      .replace(/\/\/.*$/gm, "") // Remove line comments
      .replace(/\s+/g, " ") // Normalize whitespace
      .replace(/\s*;\s*/g, ";") // Normalize semicolons
      .replace(/\s*\{\s*/g, "{") // Normalize braces
      .replace(/\s*\}\s*/g, "}") // Normalize braces
      .trim();
  };

  const normalizedExpected = normalizeModel(expectedModel);
  const normalizedActual = normalizeModel(actualModel);

  // Exact match after normalization
  if (normalizedExpected === normalizedActual) {
    return {
      equivalent: true,
      confidence: 1.0,
      differences: [],
      explanation: "Models are identical after normalization",
    };
  }

  // Extract key elements for comparison
  const extractElements = (model: string): Set<string> => {
    const elements = new Set<string>();

    // Extract part defs
    const partDefs = model.match(/part\s+def\s+(\w+)/g) || [];
    partDefs.forEach((p) => elements.add(p));

    // Extract port defs
    const portDefs = model.match(/port\s+def\s+(\w+)/g) || [];
    portDefs.forEach((p) => elements.add(p));

    // Extract requirements
    const requirements = model.match(/requirement\s+def\s+(\w+)/g) || [];
    requirements.forEach((r) => elements.add(r));

    // Extract state defs
    const stateDefs = model.match(/state\s+def\s+(\w+)/g) || [];
    stateDefs.forEach((s) => elements.add(s));

    // Extract individual state declarations (not def)
    // Match "state name;" or "state name {" but not "state def"
    const stateUsages = model.match(/\bstate\s+(?!def\b)(\w+)\s*[;{]/g) || [];
    stateUsages.forEach((s) => elements.add(s.replace(/[;{]/, "").trim()));

    // Extract action defs
    const actionDefs = model.match(/action\s+def\s+(\w+)/g) || [];
    actionDefs.forEach((a) => elements.add(a));

    // Extract packages
    const packages = model.match(/package\s+(\w+)/g) || [];
    packages.forEach((p) => elements.add(p));

    return elements;
  };

  const expectedElements = extractElements(expectedModel);
  const actualElements = extractElements(actualModel);

  // Find missing elements
  for (const elem of expectedElements) {
    if (!actualElements.has(elem)) {
      differences.push({
        element: elem,
        expected: "present",
        actual: "missing",
        significance: "major",
      });
    }
  }

  // Find extra elements
  for (const elem of actualElements) {
    if (!expectedElements.has(elem)) {
      differences.push({
        element: elem,
        expected: "not present",
        actual: "present",
        significance: "minor",
      });
    }
  }

  // Calculate equivalence
  const totalExpected = expectedElements.size;
  const totalActual = actualElements.size;
  const majorDiffs = differences.filter((d) => d.significance === "major").length;
  const minorDiffs = differences.filter((d) => d.significance === "minor").length;
  const matched = totalExpected - majorDiffs;
  const matchRatio = totalExpected > 0 ? matched / totalExpected : 1;

  // Models are not equivalent if:
  // 1. There are missing expected elements (major differences)
  // 2. Expected is empty but actual has elements (indicates actual has content expected doesn't have)
  const hasExtras = totalExpected === 0 && totalActual > 0;
  const equivalent = majorDiffs === 0 && !hasExtras;
  const confidence = equivalent ? matchRatio : matchRatio * 0.8;

  return {
    equivalent,
    confidence,
    differences,
    explanation:
      differences.length === 0
        ? "Models appear semantically equivalent (rule-based analysis)"
        : `Found ${differences.length} differences: ${majorDiffs} major, ${minorDiffs} minor`,
  };
}
