# Category 5: Model Transformation Tasks

## Goal

Test AI's ability to transform SysML v2 models between representations or refactor them.

## Tasks

### Task TRN-001: Model to Documentation

- **ID**: `sysml-transform-todoc-001`
- **Type**: `generation`
- **Difficulty**: Medium
- **Description**: Transform a SysML v2 model into structured documentation
- **Source Model**: `ForestFireDetectionSystemModel.sysml` (simpler model)
- **Prompt**: "Convert this SysML v2 model into structured documentation. Create a markdown document with:
  1. System Overview
  2. Component List with descriptions
  3. Interface descriptions
  4. Attribute tables
  Preserve all semantic information from the model."
- **Expected**: Well-structured markdown with all model elements documented
- **Evaluation**:
  - Type: `llm-judge`
  - Criteria: `["completeness", "accuracy", "documentation_quality", "structure"]`
  - Weight: 2.0

### Task TRN-002: Requirements to Model

- **ID**: `sysml-transform-req2model-001`
- **Type**: `generation`
- **Difficulty**: Hard
- **Description**: Transform requirement document into SysML v2 requirements model
- **Source**: Natural language requirements document (provided as file)
- **Prompt**: "Transform this requirements document into a SysML v2 requirements package. Each requirement should become a requirement def with:
  - Unique ID from the document
  - Doc string with the requirement text
  - Attributes for any quantitative values
  - Constraints where applicable"
- **Expected**: Valid SysML v2 requirements package
- **Evaluation**:
  - Type: `sysml-validation` + `llm-judge`
  - Criteria: `["requirement_coverage", "id_preservation", "constraint_extraction"]`
  - Weight: 2.5

### Task TRN-003: Model Refactoring - Extract Package

- **ID**: `sysml-transform-refactor-001`
- **Type**: `generation`
- **Difficulty**: Medium
- **Description**: Refactor a model by extracting elements into a separate package
- **Source Model**: `VehicleModel.sysml` (subset)
- **Prompt**: "Refactor this model by extracting all port definitions into a separate 'PortDefinitions' package. Update imports in the main package to reference the new package. Ensure the model remains valid after refactoring."
- **Expected**: Two packages with proper imports, all references resolved
- **Evaluation**:
  - Type: `sysml-validation`
  - Check: Both packages valid, imports correct
  - Weight: 2.0

### Task TRN-004: Model Simplification

- **ID**: `sysml-transform-simplify-001`
- **Type**: `generation`
- **Difficulty**: Medium
- **Description**: Simplify a complex model by removing implementation details
- **Source Model**: `DroneModelLogical.sysml` (partial)
- **Prompt**: "Create a simplified 'black box' version of this drone model that:
  1. Keeps only top-level part definitions
  2. Removes internal implementation details
  3. Preserves external ports and interfaces
  4. Maintains the public API of the system
  The result should be usable as a library for other models."
- **Expected**: Simplified model with public interfaces only
- **Evaluation**:
  - Type: `llm-judge`
  - Criteria: `["simplification_quality", "interface_preservation", "usability"]`
  - Weight: 2.0

### Task TRN-005: Cross-Notation Translation

- **ID**: `sysml-transform-notation-001`
- **Type**: `generation`
- **Difficulty**: Hard
- **Description**: Translate SysML v2 concepts to equivalent JSON schema
- **Source Model**: `Metamodel.sysml`
- **Prompt**: "Translate this SysML v2 model into an equivalent JSON Schema. Map:
  - part def → object type with properties
  - attributes → properties with types
  - constraints → JSON Schema constraints (minimum, maximum, pattern)
  - specialization → allOf inheritance
  Preserve all semantic relationships."
- **Expected**: Valid JSON Schema equivalent to the SysML model
- **Evaluation**:
  - Type: `llm-judge` + JSON schema validation
  - Criteria: `["semantic_preservation", "json_schema_validity", "type_mapping"]`
  - Weight: 3.0

### Task TRN-006: Model to PlantUML Diagram

- **ID**: `sysml-transform-plantuml-001`
- **Type**: `generation`
- **Difficulty**: Medium
- **Description**: Transform SysML v2 model to PlantUML diagram code
- **Source Model**: `system-of-systems.sysml`
- **Prompt**: "Convert this SysML v2 model into PlantUML code that visualizes:
  1. All part definitions as classes/components
  2. Specialization relationships as inheritance arrows
  3. Containment (part usages) as composition
  4. Individual instances with stereotype <<individual>>
  The PlantUML should render a clear system architecture diagram."
- **Expected**: Valid PlantUML code that renders the model structure
- **Evaluation**:
  - Type: `llm-judge`
  - Criteria: `["plantuml_validity", "relationship_mapping", "visual_clarity"]`
  - Weight: 2.0

### Task TRN-007: Model to TypeScript Interface

- **ID**: `sysml-transform-typescript-001`
- **Type**: `generation`
- **Difficulty**: Medium
- **Description**: Transform SysML v2 part definitions to TypeScript interfaces
- **Source Model**: `CalculationExample.sysml`
- **Prompt**: "Convert this SysML v2 model to TypeScript interfaces:
  - Map part def → interface
  - Map attributes → typed properties
  - Map specialization → extends
  - Map multiplicity [*] → array types
  - Include JSDoc comments for documentation
  Generate valid TypeScript that could be used in a simulation."
- **Expected**: Valid TypeScript interfaces with proper types
- **Evaluation**:
  - Type: `llm-judge` + TypeScript validation
  - Criteria: `["typescript_validity", "type_mapping", "documentation"]`
  - Weight: 2.0

### Task TRN-008: State Machine to Code

- **ID**: `sysml-transform-statemachine-001`
- **Type**: `generation`
- **Difficulty**: Hard
- **Description**: Transform SysML v2 state machine to executable code
- **Source Model**: `StopWatchStates.sysml`
- **Prompt**: "Transform this SysML v2 state machine into a TypeScript state machine implementation:
  1. Create an enum for all states
  2. Create a class with current state and transition methods
  3. Implement each transition as a method that checks current state and signal
  4. Add event handlers for each signal type
  The code should be executable and maintain state machine semantics."
- **Expected**: Valid TypeScript implementing the state machine
- **Evaluation**:
  - Type: `llm-judge`
  - Criteria: `["code_validity", "state_preservation", "transition_logic"]`
  - Weight: 3.0

### Task TRN-009: Model Decomposition

- **ID**: `sysml-transform-decompose-001`
- **Type**: `generation`
- **Difficulty**: Medium
- **Description**: Decompose a monolithic model into multiple packages
- **Source Model**: `family.sysml` (single package)
- **Prompt**: "Refactor this monolithic SysML v2 model into separate packages:
  1. 'Definitions' package - all part defs, port defs, interface defs
  2. 'Actions' package - all action defs
  3. 'Constraints' package - all constraint and requirement defs
  4. 'Model' package - the actual model with imports from above
  Ensure all cross-references use proper imports."
- **Expected**: Four valid packages with correct imports
- **Evaluation**:
  - Type: `sysml-validation`
  - Check: All packages valid, imports resolve
  - Weight: 2.5

### Task TRN-010: Model Enrichment

- **ID**: `sysml-transform-enrich-001`
- **Type**: `generation`
- **Difficulty**: Medium
- **Description**: Enrich a basic model with documentation and metadata
- **Source Model**: `InternetModel_v1.sysml` (minimal model)
- **Prompt**: "Enrich this SysML v2 model by adding:
  1. Doc strings to every part def explaining its purpose
  2. Comments explaining the relationships
  3. Metadata annotations where appropriate
  4. Default values for attributes where sensible
  Preserve all existing structure while adding documentation."
- **Expected**: Same model structure with added documentation
- **Evaluation**:
  - Type: `llm-judge`
  - Criteria: `["documentation_quality", "structure_preservation", "completeness"]`
  - Weight: 1.5

### Task TRN-011: Requirements to Test Cases

- **ID**: `sysml-transform-req2test-001`
- **Type**: `generation`
- **Difficulty**: Hard
- **Description**: Transform requirements into verification test cases
- **Source Model**: `HVACSystemRequirements.sysml`
- **Prompt**: "Transform these SysML v2 requirements into verification cases:
  For each requirement:
  1. Create a verification case definition
  2. Define test setup (preconditions)
  3. Define test procedure (actions)
  4. Define pass/fail criteria based on the requirement constraint
  5. Link back to the requirement with 'verify' relationship
  Generate valid SysML v2 verification package."
- **Expected**: Verification cases with proper structure and verify relationships
- **Evaluation**:
  - Type: `sysml-validation` + `llm-judge`
  - Criteria: `["verification_completeness", "traceability", "test_logic"]`
  - Weight: 3.0

### Task TRN-012: Model Version Migration

- **ID**: `sysml-transform-migrate-001`
- **Type**: `generation`
- **Difficulty**: Hard
- **Description**: Migrate model patterns to updated conventions
- **Source Model**: Custom model with older patterns
- **Prompt**: "This SysML v2 model uses some patterns that should be updated:
  1. Replace explicit connection defs with interface defs where appropriate
  2. Convert direct attribute assignments to redefinitions
  3. Add proper port conjugation (~) where bidirectional
  4. Use bind statements instead of redundant connections
  Modernize the model while preserving semantics."
- **Expected**: Updated model with modern SysML v2 patterns
- **Evaluation**:
  - Type: `llm-judge`
  - Criteria: `["pattern_improvement", "semantic_preservation", "syntax_correctness"]`
  - Weight: 2.5

## Implementation Notes

### Bidirectional Validation

For transformation tasks:

1. Validate source model is understood correctly
2. Validate target format is correct
3. Verify semantic equivalence (LLM-assisted)

### Semantic Equivalence Checking

Use LLM to compare:

1. All elements from source appear in target
2. Relationships are preserved
3. Constraints maintain meaning
4. No information loss (or document what's lost)

### File Handling

These tasks typically:

- Read from `files/input.sysml` or similar
- Write to `files/output.md`, `files/output.sysml`, etc.
- May produce multiple output files

### Refactoring Validation

For refactoring tasks:

1. Both resulting files must be valid
2. Cross-file references must resolve
3. No dangling references
4. Semantic equivalence to original
