/**
 * SysML v2 Validators
 *
 * Export all validator functions and types for SysML v2 benchmark tasks.
 */

// Syntax validation
export {
  validateSysmlSyntax,
  isValidSysmlSyntax,
  SYSML_V2_KEYWORDS,
  type SysmlValidationResult,
  type SyntaxError,
} from "./sysml-syntax.js";

// Component extraction
export {
  extractSysmlComponents,
  extractPartDefNames,
  extractPortDefNames,
  extractRequirementNames,
  extractStateNames,
  extractActionNames,
  compareExtracted,
  type ExtractedModel,
  type PackageInfo,
  type PartDefInfo,
  type PartInfo,
  type PortDefInfo,
  type PortInfo,
  type AttributeInfo,
  type ConnectionInfo,
  type RequirementInfo,
  type StateInfo,
  type TransitionInfo,
  type ActionInfo,
  type CompareOptions,
  type ComparisonResult,
} from "./sysml-extractor.js";

// Structure matching
export {
  buildStructureTree,
  compareTrees,
  compareStructures,
  type StructureNode,
  type StructureNodeType,
  type TreeComparisonResult,
  type MatchedNode,
  type MissingNode,
  type ExtraNode,
  type MisplacedNode,
} from "./sysml-structure.js";
