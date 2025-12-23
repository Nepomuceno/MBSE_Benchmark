# SysML v2 Requirements Traceability Tasks Implementation

You are implementing the Requirements Traceability benchmark tasks (REQ-001 to
REQ-005) for the MBSE Benchmark project. This is a self-contained prompt.

## Project Overview

**Repository**: MBSE Benchmark - A framework for evaluating AI models on
Model-Based Systems Engineering tasks, focusing on SysML v2.

**Your Task**: Implement 5 requirements tasks that test an AI's ability to work
with requirements, satisfaction relationships, and traceability.

## Project Structure

```text
├── src/
│   └── evaluation/
│       └── validators/       # SysML validators (already implemented)
├── data/
│   └── tasks/
│       ├── models/
│       │   └── source/       # Valid SysML models from GfSE repository
│       └── sysml-*/          # Individual task definitions
└── .plan/
    ├── 06-requirements.md    # Detailed task specifications
    └── local/                # Your working notes (not committed)
```

## Tasks to Implement

Create these 5 requirements tasks in `data/tasks/`:

### REQ-001: sysml-req-satisfaction-001

- **Goal**: Identify requirement satisfaction relationships
- **Source**: VehicleModel.sysml (Requirements section)
- **Prompt**: List each `satisfy` statement with requirement, component, and
  whether satisfaction can be verified from the model
- **Expected**:
  - vehicleMassRequirement satisfied by vehicle_b
  - vehicleFuelEconomyRequirements satisfied by vehicle_b
  - torqueGeneration satisfied by vehicle_b::engine
- **Difficulty**: Medium, Weight: 2.0

### REQ-002: sysml-req-coverage-001

- **Goal**: Analyze requirement coverage gaps
- **Source**: HVACSystemRequirements.sysml + component model
- **Prompt**: Identify satisfied, unsatisfied, and partially satisfied
  requirements. Suggest which components might satisfy gaps.
- **Difficulty**: Medium, Weight: 2.5

### REQ-003: sysml-req-constraint-001

- **Goal**: Verify constraint expressions with actual values
- **Source**: VehicleModel.sysml (vehicleMassRequirement section)
- **Prompt**: Analyze vehicleMassRequirement constraint:
  1. massActual <= massRequired (2000 kg)
  2. Calculate vehicle_b::mass from model
  3. Determine if constraint passes
- **Expected Calculation**:

  ```text
  dryMass = body(75) + engine(800) + transmission(875) + ...
  vehicle_b::mass = dryMass + fuelMass
  Approximately 2010 + 200 = 2210 kg
  Constraint: massActual <= 2000
  Result: FAILS (2210 > 2000)
  ```

- **Difficulty**: Hard, Weight: 2.5

### REQ-004: sysml-req-derivation-001

- **Goal**: Derive component requirements from system requirements
- **Source**: HVACSystemRequirements.sysml
- **Prompt**: Given system-level requirements, derive component-level
  requirements for: Compressor unit, Temperature sensor, Control unit
- **Output**: SysML v2 requirement defs with derive relationships
- **Difficulty**: Hard, Weight: 2.5

### REQ-005: sysml-req-impact-001

- **Goal**: Analyze impact of requirement change
- **Source**: VehicleModel.sysml
- **Prompt**: If vehicleMassRequirement changes from 2000kg to 1800kg:
  1. Which components are affected?
  2. What constraints would fail?
  3. What design changes might be needed?
- **Output**: Impact trace with affected components and cascading effects
- **Difficulty**: Hard, Weight: 3.0

## Task Directory Structure

Requirements tasks need both requirements and design models:

```text
data/tasks/sysml-req-{name}-001/
├── task.json
└── files/
    ├── requirements.sysml   # Requirements model
    ├── system.sysml         # System/design model (for coverage)
    └── README.md            # Notes on expected analysis
```

## task.json Template

```json
{
  "id": "sysml-req-{name}-001",
  "type": "analysis",
  "name": "Human-Readable Task Name",
  "description": "What this requirements task tests",
  "prompt": "Analyze the requirements in this model...\n\nFor each requirement:\n1. ...\n\nFormat your response as...",
  "maxTokens": 2500,
  "files": {
    "initial": "files",
    "expected": []
  },
  "evaluation": {
    "type": "llm-judge",
    "criteria": ["relationship_identification", "constraint_analysis", "trace_completeness"],
    "weight": 2.5
  }
}
```

## Evaluation Strategies

### For Analysis Tasks (REQ-001, REQ-002, REQ-005)

```json
{
  "evaluation": {
    "type": "llm-judge",
    "criteria": ["relationship_identification", "gap_identification", "suggestions_quality"],
    "weight": 2.5
  }
}
```

### For Calculation Tasks (REQ-003)

```json
{
  "evaluation": {
    "type": "combined",
    "strategies": [
      {"type": "element-extraction", "weight": 0.4, "expectedElements": ["FAILS", "2210"]},
      {"type": "llm-judge", "weight": 0.6, "criteria": ["calculation_accuracy", "reasoning_quality"]}
    ]
  }
}
```

### For Generation Tasks (REQ-004)

```json
{
  "evaluation": {
    "type": "combined",
    "strategies": [
      {"type": "sysml-validation", "weight": 0.3},
      {"type": "llm-judge", "weight": 0.7, "criteria": ["derivation_quality", "traceability", "sysml_syntax"]}
    ]
  }
}
```

## Input File Preparation

Extract relevant sections from source models:

| Task    | Required Files                                      |
| ------- | --------------------------------------------------- |
| REQ-001 | VehicleModel.sysml Requirements section (~100 lines)|
| REQ-002 | HVACSystemRequirements + simple component model     |
| REQ-003 | VehicleModel.sysml with mass attributes and req     |
| REQ-004 | HVACSystemRequirements.sysml                        |
| REQ-005 | VehicleModel.sysml with mass-related components     |

**Important for REQ-003**: Include all component mass attributes so the
calculation can be performed:

- body.mass
- engine.mass
- transmission.mass
- rearAxle.mass
- fuelTank.mass
- frontAxle.mass
- driveshaft.mass

## Source Models Location

Models are in `data/tasks/models/source/`:

- `VehicleModel.sysml` - Contains requirements and satisfy relationships
- `HVACSystemRequirements.sysml` - HVAC requirements with constraints

## Special Considerations

### REQ-003: Calculation Task

This task requires the AI to:

1. **Extract values**: Find all mass attribute values in the model
2. **Apply formulas**: Sum component masses per the model's equations
3. **Compare**: Check against constraint bound (2000 kg)
4. **Document reasoning**: Show step-by-step calculation

The expected answer is that the constraint FAILS because the calculated mass
(~2210 kg) exceeds the 2000 kg requirement.

### REQ-005: Impact Analysis

Requires tracing through multiple relationships:

1. Find requirement → satisfied by → component relationships
2. Trace to sub-component attributes
3. Identify cascade effects
4. Suggest design alternatives

## Prompt Writing Guidelines

**Good Prompt Example:**

```text
Analyze the vehicleMassRequirement in this model.

1. State the constraint expression and its bound value
2. Calculate the actual mass by summing all component masses:
   - List each component and its mass value
   - Show the summation
3. Determine if the constraint is satisfied (massActual <= massRequired)
4. Explain your reasoning

Format your response as:
- Constraint: [expression] with bound [value]
- Calculation: [show work]
- Result: PASS or FAIL with explanation
```

## Guidelines

1. **Include both models** - Requirements often need design context
2. **Be specific about calculations** - Show expected values
3. **Weight appropriately** - 2.0-3.0 for requirements tasks
4. **Use combined evaluation** - element-extraction for specific values
5. **Test constraint values** - Ensure they match source models

## Verification Commands

After implementing all tasks, run:

```bash
bun test
bun run lint:md
bun run lint
```

## Progress Tracking

Update `.plan/11-llm-implementation-guidance.md` when tasks are complete:

```markdown
- [x] REQ-001: sysml-req-satisfaction-001 (YYYY-MM-DD)
```

## Local Notes

Use `.plan/local/` for your working notes - this folder is not committed to git.
