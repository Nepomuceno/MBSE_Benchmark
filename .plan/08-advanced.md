# Category 8: Advanced Semantic Analysis Tasks

## Goal

Test AI's deep understanding of SysML v2 semantics, patterns, and best practices.

## Tasks

### Task ADV-001: Model Quality Assessment

- **ID**: `sysml-advanced-quality-001`
- **Type**: `analysis`
- **Difficulty**: Hard
- **Description**: Assess model quality against best practices
- **Source Model**: `family.sysml`
- **Prompt**: "Perform a quality assessment of this SysML v2 model. Evaluate:
  1. **Naming conventions** - Are names clear and consistent?
  2. **Documentation** - Are elements properly documented?
  3. **Modularity** - Is the model well-structured?
  4. **Completeness** - Are there missing elements or relationships?
  5. **Complexity** - Is the model unnecessarily complex?
  Provide a score (1-5) for each category with justification."
- **Expected**: Detailed quality report with scores and recommendations
- **Evaluation**:
  - Type: `llm-judge`
  - Criteria: `["assessment_thoroughness", "scoring_justification", "recommendations"]`
  - Weight: 3.0

### Task ADV-002: Pattern Recognition

- **ID**: `sysml-advanced-patterns-001`
- **Type**: `analysis`
- **Difficulty**: Hard
- **Description**: Identify SysML v2 modeling patterns used in the model
- **Source Model**: `VehicleModel.sysml`
- **Prompt**: "Identify modeling patterns in this model:
  1. **Definition-Usage pattern** - Where are defs vs usages?
  2. **Layered architecture** - Logical vs physical separation?
  3. **Interface segregation** - How are interfaces organized?
  4. **Variation points** - Where is variability modeled?
  5. **Requirements allocation** - How are requirements linked to design?
  For each pattern found, explain how it's implemented and its benefits."
- **Expected**: Pattern identification with explanations
- **Evaluation**:
  - Type: `llm-judge`
  - Criteria: `["pattern_identification", "explanation_quality", "benefit_analysis"]`
  - Weight: 3.0

### Task ADV-003: Model Merge/Integration

- **ID**: `sysml-advanced-merge-001`
- **Type**: `generation`
- **Difficulty**: Expert
- **Description**: Merge two partial models into a coherent whole
- **Source Models**: Two partial models with overlapping elements
- **Prompt**: "You are given two SysML v2 models that describe parts of the same system:
  - Model A: Structural definitions (parts, ports)
  - Model B: Behavioral definitions (actions, states)
  Merge these into a single coherent model:
  1. Resolve naming conflicts
  2. Connect behavioral elements to structural elements
  3. Ensure all cross-references are valid
  4. Document any assumptions made"
- **Expected**: Valid merged model with all elements integrated
- **Evaluation**:
  - Type: `sysml-validation` + `llm-judge`
  - Criteria: `["merge_completeness", "conflict_resolution", "integration_quality"]`
  - Weight: 3.5

## Implementation Notes

### Quality Metrics

Define measurable quality criteria:

- **Naming**: camelCase/PascalCase consistency
- **Documentation**: % of elements with doc strings
- **Modularity**: Package cohesion metrics
- **Completeness**: Dangling references count
- **Complexity**: Nesting depth, connection count

### Pattern Library

Common SysML v2 patterns:

1. Definition-Usage separation
2. Black box / White box views
3. Superset modeling
4. Configuration management
5. Requirements-driven design

### Model Merge Challenges

Handle:

- Same-named but different elements
- Conflicting attribute values
- Cross-package references
- Import resolution

### Expert-Level Tasks

These tasks require:

- Deep SysML v2 knowledge
- Systems engineering understanding
- Best practice awareness
- Complex reasoning
