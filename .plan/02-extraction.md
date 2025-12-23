# Category 2: Component Extraction Tasks

## Goal

Test AI's ability to extract structured information from SysML v2 models.

## Tasks

### Task EXT-001: Part Definition Extraction

- **ID**: `sysml-extract-parts-001`
- **Type**: `analysis`
- **Difficulty**: Easy
- **Description**: Extract all part definitions from a SysML v2 model
- **Source Model**: `VehicleModel.sysml`
- **Prompt**: "Extract all `part def` declarations from this SysML v2 model. Return a JSON array with objects containing: name, parent (if specializing), and attributes (list of attribute names)."
- **Expected Output Format**:

```json
[
  {"name": "Vehicle", "parent": null, "attributes": ["mass", "dryMass", "cargoMass", ...]},
  {"name": "Engine", "parent": null, "attributes": []},
  {"name": "FrontAxle", "parent": "Axle", "attributes": ["steeringAngle"]}
]
```

- **Evaluation**:
  - Type: `element-extraction`
  - Expected: All 20+ part definitions from VehicleModel
  - Weight: 1.5

### Task EXT-002: Port Definition Extraction

- **ID**: `sysml-extract-ports-001`
- **Type**: `analysis`
- **Difficulty**: Easy
- **Description**: Extract all port definitions with their directions and types
- **Source Model**: `VehicleModel.sysml`
- **Prompt**: "Extract all `port def` declarations. Return JSON with: name, items (with direction in/out and type)."
- **Expected**: All port definitions with FuelCmdPort, DrivePwrPort, etc.
- **Evaluation**:
  - Type: `element-extraction`
  - Weight: 1.5

### Task EXT-003: Requirement Extraction

- **ID**: `sysml-extract-requirements-001`
- **Type**: `analysis`
- **Difficulty**: Medium
- **Description**: Extract requirements with their constraints
- **Source Model**: `HVACSystemRequirements.sysml`
- **Prompt**: "Extract all requirement definitions from this SysML v2 model. For each, provide: id/name, documentation text, attributes, and constraint expression."
- **Expected**: All 17 requirement definitions with their doc strings and constraints
- **Evaluation**:
  - Type: `element-extraction`
  - Weight: 2.0

### Task EXT-004: Connection Extraction

- **ID**: `sysml-extract-connections-001`
- **Type**: `analysis`
- **Difficulty**: Medium
- **Description**: Extract all connections between parts
- **Source Model**: `Fischertechnik.sysml`
- **Prompt**: "Extract all `connect` statements from this model. Return: source (part.port), target (part.port), and interface type if specified."
- **Expected**: All connections in the manufacturing system model
- **Evaluation**:
  - Type: `element-extraction`
  - Weight: 1.5

### Task EXT-005: Hierarchy Extraction

- **ID**: `sysml-extract-hierarchy-001`
- **Type**: `analysis`
- **Difficulty**: Medium
- **Description**: Extract the complete part hierarchy/containment tree
- **Source Model**: `DroneModelLogical.sysml`
- **Prompt**: "Build a hierarchical tree of all parts in this model. Show parent-child containment relationships. Return as indented text or JSON tree."
- **Expected**: Complete hierarchy from Drone → body, battery, engines, flightControl, etc.
- **Evaluation**:
  - Type: `llm-judge`
  - Criteria: `["hierarchy_completeness", "relationship_accuracy", "structure"]`
  - Weight: 2.0

### Task EXT-006: Attribute Extraction with Types

- **ID**: `sysml-extract-attributes-001`
- **Type**: `analysis`
- **Difficulty**: Easy
- **Description**: Extract all attributes with their types and values
- **Source Model**: `MiningFrigate.sysml`
- **Prompt**: "Extract all attributes from MiningFrigateHull. Return: name, type, default value (if any)."
- **Expected**: hullHP, armorHP, shieldHP, oreHoldCapacity, etc. with values
- **Evaluation**:
  - Type: `element-extraction`
  - Weight: 1.0

### Task EXT-007: Action Extraction

- **ID**: `sysml-extract-actions-001`
- **Type**: `analysis`
- **Difficulty**: Medium
- **Description**: Extract action definitions and their parameters
- **Source Model**: `VehicleModel.sysml`
- **Prompt**: "Extract all `action def` declarations with their input/output parameters. Return JSON with: name, inputs (name, type), outputs (name, type)."
- **Expected**: ProvidePower, GenerateTorque, AmplifyTorque, etc.
- **Evaluation**:
  - Type: `element-extraction`
  - Weight: 1.5

### Task EXT-008: Interface Extraction

- **ID**: `sysml-extract-interfaces-001`
- **Type**: `analysis`
- **Difficulty**: Medium
- **Description**: Extract interface definitions and their endpoints
- **Source Model**: `family.sysml`
- **Prompt**: "Extract all interface definitions. For each, list: name, end ports with their types, and any nested structure."
- **Expected**: VerbalCommunication interface with communicationPartnerA/B
- **Evaluation**:
  - Type: `element-extraction`
  - Weight: 1.5

## Implementation Notes

### Validator: Component Extractor

Implement a component extractor that:

1. Parses SysML v2 using regex/grammar patterns
2. Extracts elements by type (part def, port def, requirement def, etc.)
3. Returns structured JSON for comparison
4. Handles nested structures

### Comparison Strategy

For extraction tasks, use:

1. **Exact match** for element names
2. **Fuzzy match** for types (handle aliases, qualified names)
3. **LLM assist** for semantic equivalence (e.g., "ISQ::mass" = "mass quantity")

### Expected Output Normalization

- Normalize whitespace
- Sort arrays alphabetically for comparison
- Handle optional fields gracefully
