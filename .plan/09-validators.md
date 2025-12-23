# SysML v2 Validators Implementation Plan

## Overview

This document describes the custom validators needed for SysML v2 benchmark tasks.

## Validator 1: SysML v2 Syntax Validator

### Purpose

Validate that a text output is syntactically valid SysML v2.

### Implementation

**File**: `src/evaluation/validators/sysml-syntax.ts`

```typescript
interface SysmlValidationResult {
  valid: boolean;
  errors: SyntaxError[];
  warnings: SyntaxWarning[];
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

interface SyntaxError {
  line: number;
  column: number;
  message: string;
  severity: 'error' | 'warning';
}
```

### Validation Rules

1. **Brace Matching**: All `{` have matching `}`
2. **Keyword Validity**: Only valid SysML v2 keywords used
3. **Declaration Structure**: `part def Name { ... }` pattern
4. **Import Syntax**: `import Package::*;` or `import Package::Element;`
5. **Attribute Syntax**: `attribute name : Type;` or `attribute name = value;`
6. **Port Syntax**: `port name : PortType;` with direction keywords

### Keywords to Recognize

```typescript
const SYSML_V2_KEYWORDS = [
  'package', 'part', 'part def', 'port', 'port def',
  'attribute', 'attribute def', 'item', 'item def',
  'action', 'action def', 'state', 'state def',
  'requirement', 'requirement def', 'constraint', 'constraint def',
  'interface', 'interface def', 'connection', 'connection def',
  'import', 'alias', 'in', 'out', 'inout',
  'specializes', 'subsets', 'redefines', 'ref',
  'connect', 'bind', 'flow', 'stream', 'message',
  'transition', 'accept', 'then', 'first', 'entry', 'exit', 'do',
  'calc', 'calc def', 'analysis', 'case', 'use case',
  'variation', 'variant', 'abstract', 'individual',
  'assert', 'assume', 'require', 'satisfy', 'doc'
];
```

### Testing

- [ ] Valid model → valid: true
- [ ] Missing brace → error with line number
- [ ] Invalid keyword → error identifying keyword
- [ ] Mixed valid/invalid → all errors listed

---

## Validator 2: Component Extractor

### Purpose

Extract structured information from SysML v2 models for comparison.

### Implementation

**File**: `src/evaluation/validators/sysml-extractor.ts`

```typescript
interface ExtractedModel {
  packages: PackageInfo[];
  partDefs: PartDefInfo[];
  parts: PartInfo[];
  portDefs: PortDefInfo[];
  attributes: AttributeInfo[];
  connections: ConnectionInfo[];
  requirements: RequirementInfo[];
  states: StateInfo[];
  actions: ActionInfo[];
}

interface PartDefInfo {
  name: string;
  parent?: string;  // if specializing
  attributes: string[];
  ports: string[];
  actions: string[];
}
```

### Extraction Patterns

Use regex patterns for common constructs:

```typescript
const PATTERNS = {
  packageDecl: /package\s+(\w+)\s*\{/g,
  partDef: /part\s+def\s+(\w+)(?:\s*:>\s*(\w+))?\s*\{/g,
  attribute: /attribute\s+(\w+)\s*(?::>\s*(\S+)|:\s*(\w+))?/g,
  portDef: /port\s+def\s+(\w+)\s*\{/g,
  requirementDef: /requirement\s+def\s+(?:<'([^']+)'>\s+)?(\w+)/g,
  stateDef: /state\s+def\s+(\w+)/g,
  transition: /transition\s+(\w+)\s+first\s+(\w+)\s+accept\s+(\w+)\s+then\s+(\w+)/g,
};
```

### Comparison Functions

```typescript
function compareExtracted(
  expected: ExtractedModel,
  actual: ExtractedModel,
  options: CompareOptions
): ComparisonResult {
  // Exact match for names
  // Fuzzy match for types
  // Handle optional fields
}
```

---

## Validator 3: Semantic Comparator (LLM-Assisted)

### Purpose

Compare two SysML v2 models for semantic equivalence using LLM.

### Implementation

**File**: `src/evaluation/validators/sysml-semantic.ts`

```typescript
interface SemanticComparisonResult {
  equivalent: boolean;
  confidence: number;  // 0-1
  differences: SemanticDifference[];
  explanation: string;
}

interface SemanticDifference {
  element: string;
  expected: string;
  actual: string;
  significance: 'major' | 'minor' | 'cosmetic';
}
```

### LLM Prompt Template

```text
Compare these two SysML v2 models for semantic equivalence.

Expected Model:
{expectedModel}

Actual Model:
{actualModel}

Analyze:
1. Do they define the same parts/elements?
2. Are relationships equivalent (even if expressed differently)?
3. Are constraints semantically equivalent?
4. Are there any semantic differences that matter?

Consider as equivalent:
- Different import styles (wildcard vs explicit)
- Different naming (if documented)
- Different formatting

Consider as different:
- Missing elements
- Different relationships
- Different constraint logic

Return JSON:
{
  "equivalent": boolean,
  "confidence": number (0-1),
  "differences": [{"element": "...", "significance": "major|minor|cosmetic"}],
  "explanation": "..."
}
```

### Corner Cases to Handle

1. **Import variations**: `import A::*` vs `import A::B; import A::C;`
2. **Naming aliases**: `alias X = Y::Z;` then using `X`
3. **Expression equivalence**: `a + b` vs `b + a` for commutative ops
4. **Constraint reformulation**: `x <= y` vs `y >= x`
5. **Nested vs flat**: Same semantics, different structure

---

## Validator 4: Structure Matcher

### Purpose

Compare hierarchical structures of SysML v2 models.

### Implementation

**File**: `src/evaluation/validators/sysml-structure.ts`

```typescript
interface StructureTree {
  name: string;
  type: 'package' | 'part' | 'port' | 'action' | 'state';
  children: StructureTree[];
}

function buildTree(model: string): StructureTree;
function compareTrees(
  expected: StructureTree,
  actual: StructureTree
): TreeComparisonResult;
```

### Matching Algorithm

1. Build tree from both models
2. Match nodes by name (exact) or type+position
3. Report:
   - Missing nodes
   - Extra nodes
   - Misplaced nodes (different parent)

---

## Integration with Evaluation System

### New Evaluation Type

Add to `src/evaluation/strategies/`:

```typescript
// sysml-validation.ts
export class SysmlValidationStrategy implements EvaluationStrategy {
  type = 'sysml-validation';
  
  async evaluate(response: string, task: Task): Promise<EvaluationResult> {
    const syntaxResult = validateSysmlSyntax(response);
    if (!syntaxResult.valid) {
      return { score: 0, details: { errors: syntaxResult.errors } };
    }
    
    const extracted = extractComponents(response);
    const expected = task.expectedElements;
    const comparison = compareExtracted(expected, extracted);
    
    return {
      score: comparison.matchRatio,
      details: {
        matched: comparison.matched,
        missing: comparison.missing,
        extra: comparison.extra
      }
    };
  }
}
```

### Combined Evaluation

For complex tasks, combine validators:

```typescript
// In task.json
{
  "evaluation": {
    "type": "combined",
    "strategies": [
      { "type": "sysml-validation", "weight": 0.3 },
      { "type": "element-extraction", "weight": 0.3 },
      { "type": "llm-judge", "weight": 0.4, "criteria": [...] }
    ]
  }
}
```

---

## Testing Plan

### Unit Tests

- [ ] Syntax validator with valid models
- [ ] Syntax validator with various error types
- [ ] Extractor with all element types
- [ ] Structure matcher with nested models
- [ ] Semantic comparator with equivalent models
- [ ] Semantic comparator with different models

### Integration Tests

- [ ] Full validation pipeline
- [ ] Combined evaluation strategies
- [ ] LLM judge integration

### Test Data

Use models from GfSE repository:

- Valid: Original models as-is
- Invalid: Programmatically modified versions
- Equivalent: Reformatted versions with same semantics
