# Category 3: Model Analysis Tasks

## Goal

Test AI's ability to analyze SysML v2 models for relationships, patterns, and semantics.

## Tasks

### Task ANA-001: Part Specialization Analysis

- **ID**: `sysml-analyze-specialization-001`
- **Type**: `analysis`
- **Difficulty**: Medium
- **Description**: Identify all specialization (inheritance) relationships
- **Source Model**: `VehicleModel.sysml`
- **Prompt**: "Analyze the specialization relationships in this model. Create a diagram (as text/ASCII) showing the inheritance hierarchy. List all `:>` specialization relationships."
- **Expected**:
  - FrontAxle :> Axle
  - VehicleSoftware :> Software
  - VehicleController :> Software
  - All individual defs :> their base types
- **Evaluation**:
  - Type: `llm-judge`
  - Criteria: `["completeness", "accuracy", "visualization_clarity"]`
  - Weight: 1.5

### Task ANA-002: Flow Analysis

- **ID**: `sysml-analyze-flow-001`
- **Type**: `analysis`
- **Difficulty**: Hard
- **Description**: Trace data/material flow through the system
- **Source Model**: `VehicleModel.sysml` (ActionTree section)
- **Prompt**: "Trace the flow of torque from engine to wheels in this model. Identify each action in the chain and describe what transformations occur at each step."
- **Expected**:
  - generateTorque → engineTorque
  - amplifyTorque → transmissionTorque
  - transferTorque → driveshaftTorque
  - distributeTorque → wheelToRoadTorque
- **Evaluation**:
  - Type: `llm-judge`
  - Criteria: `["flow_tracing", "transformation_understanding", "completeness"]`
  - Weight: 2.0

### Task ANA-003: Constraint Analysis

- **ID**: `sysml-analyze-constraints-001`
- **Type**: `analysis`
- **Difficulty**: Medium
- **Description**: Analyze constraints and their implications
- **Source Model**: `HVACSystemRequirements.sysml`
- **Prompt**: "For each requirement in this model, explain what the constraint enforces and what system behaviors would violate it."
- **Expected**: Clear explanation of each constraint's purpose and violation scenarios
- **Evaluation**:
  - Type: `llm-judge`
  - Criteria: `["constraint_understanding", "violation_examples", "clarity"]`
  - Weight: 2.0

### Task ANA-004: Package Dependency Analysis

- **ID**: `sysml-analyze-dependencies-001`
- **Type**: `analysis`
- **Difficulty**: Medium
- **Description**: Identify import dependencies between packages
- **Source Model**: `DroneModelLogical.sysml`
- **Prompt**: "Analyze the package structure and imports. Create a dependency graph showing which packages depend on which. Identify any circular dependencies."
- **Expected**:
  - ForestFireObservationDrone imports Drone_SharedAssetsSuperset
  - DroneBattery imports (none)
  - DroneEngine imports DroneEngine_Parts
  - etc.
- **Evaluation**:
  - Type: `llm-judge`
  - Criteria: `["dependency_identification", "graph_accuracy", "circular_detection"]`
  - Weight: 1.5

### Task ANA-005: Variation Analysis

- **ID**: `sysml-analyze-variations-001`
- **Type**: `analysis`
- **Difficulty**: Hard
- **Description**: Analyze variation points and variants in the model
- **Source Model**: `family.sysml`
- **Prompt**: "Identify all variation points in this model. For each, list the available variants and explain what differs between them."
- **Expected**:
  - adoption_certificate variation with TypeB1, TypeB2, TypeC variants
  - Explanation of different parent combinations
- **Evaluation**:
  - Type: `llm-judge`
  - Criteria: `["variation_identification", "variant_description", "difference_explanation"]`
  - Weight: 2.0

### Task ANA-006: Connection Topology Analysis

- **ID**: `sysml-analyze-topology-001`
- **Type**: `analysis`
- **Difficulty**: Hard
- **Description**: Analyze the connection topology and identify communication patterns
- **Source Model**: `Fischertechnik.sysml`
- **Prompt**: "Analyze the connection topology of this manufacturing system. Identify: (1) Hub components with many connections, (2) Linear chains, (3) Bidirectional vs unidirectional flows."
- **Expected**:
  - Manufacturer as hub
  - Production line as linear chain
  - Customer-Manufacturer bidirectional
- **Evaluation**:
  - Type: `llm-judge`
  - Criteria: `["topology_understanding", "pattern_recognition", "flow_direction"]`
  - Weight: 2.5

### Task ANA-007: Individual vs Definition Analysis

- **ID**: `sysml-analyze-individuals-001`
- **Type**: `analysis`
- **Difficulty**: Medium
- **Description**: Distinguish between definitions and individual instances
- **Source Model**: `system-of-systems.sysml`
- **Prompt**: "In this model, identify which elements are definitions vs individuals. Explain the relationship between `Enterprise_alpha` as a definition and `enterprise_alpha` as an individual."
- **Expected**:
  - Clear distinction between `individual part def` and `individual part`
  - Understanding of typing relationship
- **Evaluation**:
  - Type: `llm-judge`
  - Criteria: `["definition_vs_instance", "relationship_understanding", "sysml_v2_concepts"]`
  - Weight: 1.5

### Task ANA-008: Cross-Model Reference Analysis

- **ID**: `sysml-analyze-crossref-001`
- **Type**: `analysis`
- **Difficulty**: Hard
- **Description**: Given multiple files, trace references across models
- **Source Models**: Multiple files from `example_EveOnlineMiningFrigate/`
- **Prompt**: "These files are part of the same model. Trace how MiningFrigate uses definitions from COTS.sysml and StdPortsAndInterfaces.sysml. List all cross-file references."
- **Expected**: Identification of imports and cross-file type references
- **Evaluation**:
  - Type: `llm-judge`
  - Criteria: `["cross_reference_tracing", "import_understanding", "completeness"]`
  - Weight: 2.5

## Implementation Notes

### Multi-File Tasks

For ANA-008 and similar:

- Provide multiple files in `files/` directory
- Task prompt should indicate relationship
- Evaluation must consider cross-file context

### LLM Judge Criteria

For analysis tasks, use LLM judge with criteria:

1. **Accuracy** - Is the analysis factually correct?
2. **Completeness** - Are all relevant elements covered?
3. **Insight** - Does the analysis provide useful insights?
4. **Structure** - Is the response well-organized?

### Semantic Understanding

These tasks test deep understanding:

- Specialization vs composition
- Flow semantics (stream, connect, bind)
- Variation point modeling
- Definition vs instance distinction
