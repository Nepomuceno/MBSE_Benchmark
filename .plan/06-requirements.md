# Category 6: Requirement Traceability Tasks

## Goal

Test AI's ability to work with requirements, satisfaction relationships, and traceability.

## Tasks

### Task REQ-001: Requirement Satisfaction Identification

- **ID**: `sysml-req-satisfaction-001`
- **Type**: `analysis`
- **Difficulty**: Medium
- **Description**: Identify which components satisfy which requirements
- **Source Model**: `VehicleModel.sysml` (Requirements section)
- **Prompt**: "Analyze this model and identify all requirement satisfaction relationships. For each `satisfy` statement, list:
  1. The requirement being satisfied
  2. The component satisfying it
  3. Whether the satisfaction can be verified from the model (check constraints)"
- **Expected**:
  - vehicleMassRequirement satisfied by vehicle_b
  - vehicleFuelEconomyRequirements satisfied by vehicle_b
  - torqueGeneration satisfied by vehicle_b::engine
  - Analysis of whether constraints actually pass
- **Evaluation**:
  - Type: `llm-judge`
  - Criteria: `["relationship_identification", "constraint_analysis", "verification_insight"]`
  - Weight: 2.0

### Task REQ-002: Requirement Coverage Analysis

- **ID**: `sysml-req-coverage-001`
- **Type**: `analysis`
- **Difficulty**: Medium
- **Description**: Analyze requirement coverage - which requirements lack satisfaction
- **Source Model**: Modified `HVACSystemRequirements.sysml` + component model
- **Prompt**: "Given these requirements and this system model, identify:
  1. Requirements that are satisfied (with evidence)
  2. Requirements that are NOT satisfied
  3. Requirements that are partially satisfied
  For unsatisfied requirements, suggest which components might satisfy them."
- **Expected**: Complete coverage analysis with suggestions
- **Evaluation**:
  - Type: `llm-judge`
  - Criteria: `["coverage_accuracy", "gap_identification", "suggestions_quality"]`
  - Weight: 2.5

### Task REQ-003: Constraint Verification

- **ID**: `sysml-req-constraint-001`
- **Type**: `analysis`
- **Difficulty**: Hard
- **Description**: Verify if constraint expressions are satisfiable given attribute values
- **Source Model**: `VehicleModel.sysml`
- **Prompt**: "Analyze the vehicleMassRequirement in this model:
  1. The constraint requires massActual <= massRequired (2000)
  2. Calculate vehicle_b::mass from the model (sum of components + fuel)
  3. Determine if the constraint is satisfied
  Show your calculation and conclusion."
- **Expected**:
  - Calculation: 75 + 800 + 875 + 200 + 100 + 100 + 60 = 2210 kg
  - Conclusion: FAILS (2210 > 2000)
- **Evaluation**:
  - Type: `element-extraction` + `llm-judge`
  - Check: Correct calculation and conclusion
  - Weight: 2.5

### Task REQ-004: Requirement Derivation

- **ID**: `sysml-req-derivation-001`
- **Type**: `generation`
- **Difficulty**: Hard
- **Description**: Derive component requirements from system requirements
- **Source Model**: `HVACSystemRequirements.sysml`
- **Prompt**: "Given the system-level HVAC requirements, derive component-level requirements for these subsystems:
  1. Compressor unit
  2. Temperature sensor
  3. Control unit
  Generate SysML v2 requirement definitions with proper derive relationships."
- **Expected**: Derived requirements with proper relationships
- **Evaluation**:
  - Type: `llm-judge`
  - Criteria: `["derivation_quality", "traceability", "sysml_syntax"]`
  - Weight: 2.5

### Task REQ-005: Impact Analysis

- **ID**: `sysml-req-impact-001`
- **Type**: `analysis`
- **Difficulty**: Hard
- **Description**: Analyze the impact of changing a requirement
- **Source Model**: `VehicleModel.sysml`
- **Prompt**: "If we change the vehicleMassRequirement from 2000kg to 1800kg:
  1. Which components are affected?
  2. What constraints would fail?
  3. What design changes might be needed?
  Trace through all related requirements and components."
- **Expected**: Impact trace showing affected components and cascading effects
- **Evaluation**:
  - Type: `llm-judge`
  - Criteria: `["impact_completeness", "trace_accuracy", "change_suggestions"]`
  - Weight: 3.0

## Implementation Notes

### Traceability Matrix Generation

Tasks may require generating:

- Requirement-to-Component matrix
- Requirement-to-Requirement (derivation) matrix
- Coverage statistics

### Calculation Tasks

For tasks requiring calculation:

1. Extract attribute values from model
2. Apply formulas from model (sum, constraints)
3. Compare against constraint bounds
4. Document the reasoning

### LLM Judge for Traceability

Judge should verify:

1. All satisfy/derive relationships found
2. Correct interpretation of constraints
3. Accurate calculations
4. Logical reasoning in analysis

### Multi-Model Tasks

Some tasks require:

- Requirements model (what should be done)
- Design model (what is designed)
- Comparison between them
