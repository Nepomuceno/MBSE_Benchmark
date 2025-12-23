# Category 1: SysML v2 Syntax Validation Tasks

## Goal

Test AI's ability to recognize valid vs invalid SysML v2 syntax and identify errors.

## Tasks

### Task VAL-001: Valid SysML Detection

- **ID**: `sysml-valid-detection-001`
- **Type**: `qa`
- **Difficulty**: Easy
- **Description**: Given a valid SysML v2 file, determine if it is syntactically correct
- **Source Model**: `VehicleModel.sysml` (first 50 lines)
- **Prompt**: "Analyze the following SysML v2 code and determine if it is syntactically valid. Answer 'VALID' or 'INVALID' followed by a brief explanation."
- **Expected**: VALID with explanation about package structure, imports, part definitions
- **Evaluation**:
  - Type: `keyword-match`
  - Keywords: `["VALID", "package", "import", "part def"]`
  - Weight: 1.0

### Task VAL-002: Invalid Syntax Detection - Missing Braces

- **ID**: `sysml-invalid-braces-001`
- **Type**: `qa`
- **Difficulty**: Easy
- **Description**: Detect missing closing braces in SysML v2
- **Source**: Modified `StopWatchStates.sysml` with removed closing brace
- **Prompt**: "Analyze this SysML v2 code and identify any syntax errors. List each error with line number and description."
- **Expected**: Detection of missing brace, location identification
- **Evaluation**:
  - Type: `llm-judge`
  - Criteria: `["error_detection", "location_accuracy", "explanation_quality"]`
  - Weight: 1.0

### Task VAL-003: Invalid Syntax Detection - Wrong Keywords

- **ID**: `sysml-invalid-keywords-001`
- **Type**: `qa`
- **Difficulty**: Medium
- **Description**: Detect incorrect SysML v2 keywords (e.g., `class` instead of `part def`)
- **Source**: Modified `Metamodel.sysml` with SysML v1 style keywords
- **Prompt**: "This code attempts to be SysML v2 but contains errors. Identify each error and suggest the correct SysML v2 syntax."
- **Expected**: Detection of `class` → should be `part def`, etc.
- **Evaluation**:
  - Type: `llm-judge`
  - Criteria: `["error_count", "correction_accuracy", "sysml_v2_knowledge"]`
  - Weight: 1.5

### Task VAL-004: Mixed Valid/Invalid Blocks

- **ID**: `sysml-mixed-validation-001`
- **Type**: `qa`
- **Difficulty**: Medium
- **Description**: Given multiple code blocks, identify which are valid SysML v2
- **Source**: Mix of valid snippets from multiple models + invented invalid ones
- **Prompt**: "Below are 5 SysML v2 code snippets labeled A-E. For each, state if it is VALID or INVALID and explain why."
- **Expected**: Correct classification of all 5 snippets with reasoning
- **Evaluation**:
  - Type: `element-extraction`
  - Expected Elements: Correct V/I labels for all snippets
  - Weight: 2.0

### Task VAL-005: Semantic Validity Check

- **ID**: `sysml-semantic-validity-001`
- **Type**: `analysis`
- **Difficulty**: Hard
- **Description**: Check if syntactically valid code is semantically correct (e.g., references exist)
- **Source**: Modified `DroneModelLogical.sysml` with invalid references
- **Prompt**: "This SysML v2 code is syntactically correct but may have semantic errors. Identify any references to undefined elements, type mismatches, or constraint violations."
- **Expected**: Detection of undefined references, type issues
- **Evaluation**:
  - Type: `llm-judge`
  - Criteria: `["semantic_understanding", "reference_checking", "completeness"]`
  - Weight: 2.0

### Task VAL-006: Constraint Syntax Validation

- **ID**: `sysml-constraint-syntax-001`
- **Type**: `qa`
- **Difficulty**: Medium
- **Description**: Validate constraint expressions in SysML v2
- **Source**: `HVACSystemRequirements.sysml` constraint blocks
- **Prompt**: "Examine these SysML v2 constraint definitions. Are the constraint expressions syntactically and semantically correct? Identify any issues."
- **Expected**: Identification of valid constraint syntax, explanation of constraint semantics
- **Evaluation**:
  - Type: `llm-judge`
  - Criteria: `["constraint_understanding", "expression_validity", "explanation"]`
  - Weight: 1.5

## Implementation Notes

### Files to Create

For each task:

1. `data/tasks/{task-id}/task.json` - Task definition
2. `data/tasks/{task-id}/files/` - Input SysML files (copied/modified from source)

### Invalid Examples to Generate

Create modified versions of valid models with:

- Missing braces/semicolons
- Invalid keywords (SysML v1 style)
- Undefined references
- Type mismatches
- Malformed expressions

### Validator Requirements

These tasks require the **SysML v2 Syntax Validator** to:

- Parse SysML v2 tokens
- Validate basic structure (packages, parts, ports, etc.)
- Check brace/bracket matching
- Verify keyword validity
