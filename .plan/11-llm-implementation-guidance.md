# LLM Implementation Guidance

## Overview

This document provides guidance for AI agents implementing the SysML v2 benchmark tasks. Follow these practices to ensure consistency, quality, and traceability.

## Progress Tracking

### Marking Tasks as Complete

When implementing a task, update the checklist in this file:

```markdown
- [x] Task ID - Brief description (YYYY-MM-DD)
```

### Implementation Status Legend

- `[ ]` - Not started
- `[~]` - In progress
- `[x]` - Complete and tested
- `[!]` - Blocked or needs review

---

## Implementation Checklist

### Phase 1: Validators

#### SysML Syntax Validator

- [x] Create `src/evaluation/validators/sysml-syntax.ts` (2025-12-22)
- [x] Implement brace matching validation (2025-12-22)
- [x] Implement keyword validation (2025-12-22)
- [x] Implement structure validation (package, part def, etc.) (2025-12-22)
- [x] Add unit tests in `src/evaluation/validators/sysml-syntax.test.ts` (2025-12-22)
- [ ] Verify with valid models from source repo
- [ ] Verify with intentionally invalid models

#### Component Extractor

- [x] Create `src/evaluation/validators/sysml-extractor.ts` (2025-12-22)
- [x] Implement part def extraction (2025-12-22)
- [x] Implement port def extraction (2025-12-22)
- [x] Implement attribute extraction (2025-12-22)
- [x] Implement connection extraction (2025-12-22)
- [x] Implement requirement extraction (2025-12-22)
- [x] Implement state extraction (2025-12-22)
- [x] Implement action extraction (2025-12-22)
- [x] Add unit tests (2025-12-22)
- [ ] Test with VehicleModel.sysml
- [ ] Test with DroneModelLogical.sysml

#### Semantic Comparator

- [ ] Create `src/evaluation/validators/sysml-semantic.ts`
- [ ] Define comparison result types
- [ ] Implement LLM prompt for comparison
- [ ] Handle corner cases (imports, aliases, expressions)
- [ ] Add integration tests with LLM

> **Note:** Semantic Comparator deferred to future session - requires LLM integration.

#### Structure Matcher

- [x] Create `src/evaluation/validators/sysml-structure.ts` (2025-12-22)
- [x] Implement tree building from SysML (2025-12-22)
- [x] Implement tree comparison algorithm (2025-12-22)
- [x] Add unit tests (2025-12-22)

#### Evaluation Strategy Registration

- [x] Create `src/evaluation/strategies/sysml-validation.ts` (2025-12-22)
- [ ] Register in strategy factory
- [x] Add combined evaluation support (2025-12-22)
- [x] Update evaluation types (2025-12-22)

> **Note:** Strategy factory registration deferred - depends on how strategies are loaded in the benchmark runner.

### Phase 2: Source Data Preparation

#### Model Files

- [x] Clone GfSE/SysML-v2-Models repository models (2025-12-22)
- [x] Copy required models to `data/tasks/models/source/` (2025-12-22)
- [x] Create `data/tasks/models/LICENSE.md` with attribution (2025-12-22)
- [x] Verify all models are syntactically valid (2025-12-22)

#### Invalid Model Variants

- [x] Create `data/tasks/models/invalid/` directory (2025-12-22)
- [x] Generate missing-brace variants (2025-12-22)
- [x] Generate invalid-keyword variants (2025-12-22)
- [x] Generate undefined-reference variants (2025-12-22)
- [x] Generate malformed-expression variants (2025-12-22)
- [x] Document each variant's error type (2025-12-22)

### Phase 3: Task Implementation

#### Validation Tasks (VAL-001 to VAL-006)

- [x] VAL-001: sysml-valid-detection-001 (2025-12-22)
- [x] VAL-002: sysml-invalid-braces-001 (2025-12-22)
- [x] VAL-003: sysml-invalid-keywords-001 (2025-12-22)
- [x] VAL-004: sysml-mixed-validation-001 (2025-12-22)
- [x] VAL-005: sysml-semantic-validity-001 (2025-12-22)
- [x] VAL-006: sysml-constraint-syntax-001 (2025-12-22)

#### Extraction Tasks (EXT-001 to EXT-008)

- [x] EXT-001: sysml-extract-parts-001 (2025-12-22)
- [x] EXT-002: sysml-extract-ports-001 (2025-12-22)
- [x] EXT-003: sysml-extract-requirements-001 (2025-12-22)
- [x] EXT-004: sysml-extract-connections-001 (2025-12-22)
- [x] EXT-005: sysml-extract-hierarchy-001 (2025-12-22)
- [x] EXT-006: sysml-extract-attributes-001 (2025-12-22)
- [x] EXT-007: sysml-extract-actions-001 (2025-12-22)
- [x] EXT-008: sysml-extract-interfaces-001 (2025-12-22)

#### Analysis Tasks (ANA-001 to ANA-008)

- [x] ANA-001: sysml-analyze-specialization-001 (2025-12-23)
- [x] ANA-002: sysml-analyze-flow-001 (2025-12-23)
- [x] ANA-003: sysml-analyze-constraints-001 (2025-12-23)
- [x] ANA-004: sysml-analyze-dependencies-001 (2025-12-23)
- [x] ANA-005: sysml-analyze-variations-001 (2025-12-23)
- [x] ANA-006: sysml-analyze-topology-001 (2025-12-23)
- [x] ANA-007: sysml-analyze-individuals-001 (2025-12-23)
- [x] ANA-008: sysml-analyze-crossref-001 (2025-12-23)

#### Generation Tasks (GEN-001 to GEN-014)

- [x] GEN-001: sysml-generate-part-001 (2025-12-23)
- [x] GEN-002: sysml-generate-ports-001 (2025-12-23)
- [x] GEN-003: sysml-generate-requirements-001 (2025-12-23)
- [x] GEN-004: sysml-generate-states-001 (2025-12-23)
- [x] GEN-005: sysml-generate-actions-001 (2025-12-23)
- [x] GEN-006: sysml-generate-subsystem-001 (2025-12-23)
- [x] GEN-007: sysml-generate-variation-001 (2025-12-23)
- [x] GEN-008: sysml-generate-usecase-001 (2025-12-23)
- [x] GEN-009: sysml-generate-constraints-001 (2025-12-23)
- [x] GEN-010: sysml-generate-calc-001 (2025-12-23)
- [x] GEN-011: sysml-generate-connections-001 (2025-12-23)
- [x] GEN-012: sysml-generate-analysis-001 (2025-12-23)
- [x] GEN-013: sysml-generate-individual-001 (2025-12-23)
- [x] GEN-014: sysml-generate-messages-001 (2025-12-23)

#### Transformation Tasks (TRN-001 to TRN-012)

- [ ] TRN-001: sysml-transform-todoc-001
- [ ] TRN-002: sysml-transform-req2model-001
- [ ] TRN-003: sysml-transform-refactor-001
- [ ] TRN-004: sysml-transform-simplify-001
- [ ] TRN-005: sysml-transform-notation-001
- [ ] TRN-006: sysml-transform-plantuml-001
- [ ] TRN-007: sysml-transform-typescript-001
- [ ] TRN-008: sysml-transform-statemachine-001
- [ ] TRN-009: sysml-transform-decompose-001
- [ ] TRN-010: sysml-transform-enrich-001
- [ ] TRN-011: sysml-transform-req2test-001
- [ ] TRN-012: sysml-transform-migrate-001

#### Requirements Tasks (REQ-001 to REQ-005)

- [ ] REQ-001: sysml-req-satisfaction-001
- [ ] REQ-002: sysml-req-coverage-001
- [ ] REQ-003: sysml-req-constraint-001
- [ ] REQ-004: sysml-req-derivation-001
- [ ] REQ-005: sysml-req-impact-001

#### State Machine Tasks (STM-001 to STM-003)

- [ ] STM-001: sysml-state-extraction-001
- [ ] STM-002: sysml-state-complex-001
- [ ] STM-003: sysml-state-compare-001

#### Advanced Tasks (ADV-001 to ADV-003)

- [ ] ADV-001: sysml-advanced-quality-001
- [ ] ADV-002: sysml-advanced-patterns-001
- [ ] ADV-003: sysml-advanced-merge-001

### Phase 4: Testing & Validation

- [ ] Run all tasks against test model
- [ ] Verify scoring consistency
- [ ] Calibrate task weights
- [ ] Document edge cases found

### Phase 5: Documentation

- [ ] Update `data/tasks/index.json`
- [ ] Update main README.md
- [ ] Create category documentation
- [ ] Final review

---

## Best Practices for Implementation

### 1. File Structure Conventions

When creating a task:

```text
data/tasks/{task-id}/
├── task.json           # Task definition (required)
└── files/              # Input files (required for file-based tasks)
    ├── input.sysml     # Primary input
    ├── expected.json   # Expected extraction results (if applicable)
    └── README.md       # Task-specific notes (optional)
```

### 2. Task JSON Schema

Always include these fields:

```json
{
  "id": "unique-task-id",
  "type": "qa|analysis|generation",
  "name": "Human-Readable Name",
  "description": "What this task tests and why it matters",
  "prompt": "The exact prompt - be specific and unambiguous",
  "maxTokens": 2000,
  "files": {
    "initial": "files",
    "expected": []
  },
  "evaluation": {
    "type": "evaluation-type",
    "weight": 1.0
  }
}
```

### 3. Prompt Writing Guidelines

**DO:**

- Be specific about expected output format
- Include examples when helpful
- Specify any constraints or requirements
- Use consistent terminology

**DON'T:**

- Leave ambiguity about what success looks like
- Assume knowledge not provided in context
- Use vague terms like "appropriate" without definition

**Example - Good Prompt:**

```text
Extract all `part def` declarations from this SysML v2 model.
Return a JSON array where each object has:
- "name": string - the part definition name
- "parent": string|null - the parent type if specializing (after :>)
- "attributes": string[] - list of attribute names defined in the part

Example output format:
[{"name": "Vehicle", "parent": null, "attributes": ["mass", "velocity"]}]
```

**Example - Bad Prompt:**

```text
Get the parts from this model.
```

### 4. Evaluation Configuration

#### For Deterministic Tasks (Extraction)

```json
{
  "evaluation": {
    "type": "element-extraction",
    "expectedElements": ["Element1", "Element2"],
    "weight": 1.5
  }
}
```

#### For Subjective Tasks (Analysis, Generation)

```json
{
  "evaluation": {
    "type": "llm-judge",
    "criteria": [
      "accuracy",
      "completeness", 
      "syntax_validity",
      "explanation_quality"
    ],
    "weight": 2.0
  }
}
```

#### For Combined Evaluation

```json
{
  "evaluation": {
    "type": "combined",
    "strategies": [
      {"type": "sysml-validation", "weight": 0.3},
      {"type": "llm-judge", "weight": 0.7, "criteria": [...]}
    ]
  }
}
```

### 5. Testing Each Task

Before marking a task complete:

1. **Syntax Check**: Validate task.json is valid JSON
2. **File Check**: Verify all referenced files exist
3. **Dry Run**: Test with a mock model response
4. **Edge Cases**: Consider what happens with:
   - Empty response
   - Partial response
   - Incorrect format
   - Extra information

### 6. Weight Assignment Guidelines

| Difficulty | Base Weight | Adjusted For              |
| ---------- | ----------- | ------------------------- |
| Easy       | 1.0         | +0.5 if foundational      |
| Medium     | 1.5 - 2.0   | +0.5 if multi-step        |
| Hard       | 2.0 - 2.5   | +0.5 if requires synthesis|
| Expert     | 3.0+        | Based on complexity       |

### 7. LLM Judge Criteria Guidelines

Choose criteria that are:

- **Measurable**: Can be objectively assessed
- **Relevant**: Directly relate to task goals
- **Distinct**: Don't overlap significantly

Common criteria by task type:

**Extraction Tasks:**

- completeness, accuracy, format_correctness

**Analysis Tasks:**

- insight_quality, reasoning, evidence_usage

**Generation Tasks:**

- syntax_validity, semantic_correctness, requirements_coverage

**Transformation Tasks:**

- semantic_preservation, format_validity, information_completeness

### 8. Error Handling

Tasks should gracefully handle:

- Models with syntax errors (for validation tasks)
- Missing optional elements
- Variations in formatting
- Alternative valid representations

### 9. Documentation Requirements

Each implemented task should have:

1. Clear prompt with expected format
2. Sample expected output (in task.json or separate file)
3. Evaluation criteria with rationale
4. Notes on edge cases

### 10. Commit Messages

When implementing tasks, use conventional commits:

```text
feat(tasks): add VAL-001 valid detection task

- Created task.json with validation prompt
- Added VehicleModel excerpt as input file
- Configured keyword-match evaluation
```

---

## Validation Before Completion

### Per-Task Checklist

Before marking any task `[x]`:

- [ ] `task.json` is valid JSON
- [ ] All file paths in task.json exist
- [ ] Prompt is clear and unambiguous
- [ ] Evaluation type matches task type
- [ ] Weight is appropriate for difficulty
- [ ] At least one test run completed
- [ ] Edge cases documented

### Per-Phase Checklist

Before moving to next phase:

- [ ] All tasks in phase are `[x]`
- [ ] `bun test` passes
- [ ] `bun run lint` passes
- [ ] No TypeScript errors
- [ ] Documentation updated

---

## Common Pitfalls to Avoid

### 1. Overly Complex Prompts

❌ Don't include unnecessary context
✅ Keep prompts focused on the specific task

### 2. Ambiguous Expected Outputs

❌ "Return the parts" (what format?)
✅ "Return a JSON array of part names as strings"

### 3. Inconsistent File Naming

❌ `Task1.json`, `task-2.json`, `TASK_3.json`
✅ `sysml-{category}-{name}-{number}` consistently

### 4. Missing Edge Case Handling

❌ Only test happy path
✅ Test empty, partial, malformed responses

### 5. Hardcoded Paths

❌ `/Users/myname/project/...`
✅ Relative paths from task directory

### 6. Forgetting Attribution

❌ Copy models without license
✅ Include LICENSE.md with proper attribution

---

## Quick Reference

### Task ID Pattern

```text
sysml-{category}-{descriptor}-{number}

Examples:
- sysml-valid-detection-001
- sysml-extract-parts-001
- sysml-generate-states-001
```

### File Locations

| Type           | Location                       |
| -------------- | ------------------------------ |
| Tasks          | `data/tasks/{task-id}/`        |
| Source Models  | `data/tasks/models/source/`    |
| Invalid Models | `data/tasks/models/invalid/`   |
| Validators     | `src/evaluation/validators/`   |
| Strategies     | `src/evaluation/strategies/`   |

### Commands

```bash
# Run tests
bun test

# Run specific test file
bun test src/evaluation/validators/sysml-syntax.test.ts

# Lint check
bun run lint

# Type check
bun run typecheck

# Validate SysML files with built-in validator
bun run -e "import {validateSysmlSyntax} from './src/evaluation/validators'; import {readFileSync} from 'fs'; const r = validateSysmlSyntax(readFileSync('path/to/file.sysml','utf-8')); console.log(r.valid, r.errors)"

# Run benchmark (when ready)
bun run bench --model test-model
```

### Validating Task Input Files

Use the built-in validators to check SysML syntax:

```typescript
import { validateSysmlSyntax, extractSysmlComponents } from './src/evaluation/validators';
import { readFileSync } from 'fs';

const content = readFileSync('data/tasks/models/source/file.sysml', 'utf-8');
const result = validateSysmlSyntax(content);
console.log(result.valid, result.errors);
```

**Note:** The built-in validator checks brace matching and basic structure.
For comprehensive validation, source models are from the
[GfSE SysML-v2-Models](https://github.com/GfSE/SysML-v2-Models) repository
which are validated against their official parser.
