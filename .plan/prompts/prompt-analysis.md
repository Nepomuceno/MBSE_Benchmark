# SysML v2 Analysis Tasks Implementation

You are implementing the Analysis benchmark tasks (ANA-001 to ANA-008) for the
MBSE Benchmark project. This is a self-contained prompt with all context needed.

## Project Overview

**Repository**: MBSE Benchmark - A framework for evaluating AI models on
Model-Based Systems Engineering tasks, focusing on SysML v2.

**Your Task**: Implement 8 analysis tasks that test an AI's ability to analyze
relationships, patterns, and semantics in SysML v2 models.

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
    ├── 03-analysis.md        # Detailed task specifications
    └── local/                # Your working notes (not committed)
```

## Tasks to Implement

Create these 8 analysis tasks in `data/tasks/`:

### ANA-001: sysml-analyze-specialization-001

- **Goal**: Identify all specialization (inheritance) relationships
- **Source**: VehicleModel.sysml
- **Prompt**: Analyze specialization relationships, create ASCII inheritance diagram
- **Expected**: FrontAxle :> Axle, VehicleSoftware :> Software, etc.
- **Difficulty**: Medium, Weight: 1.5

### ANA-002: sysml-analyze-flow-001

- **Goal**: Trace data/material flow through the system
- **Source**: VehicleModel.sysml (ActionTree section)
- **Prompt**: Trace torque flow from engine to wheels
- **Expected**: generateTorque → amplifyTorque → transferTorque → distributeTorque
- **Difficulty**: Hard, Weight: 2.0

### ANA-003: sysml-analyze-constraints-001

- **Goal**: Analyze constraints and their implications
- **Source**: HVACSystemRequirements.sysml
- **Prompt**: Explain what each constraint enforces and violation scenarios
- **Difficulty**: Medium, Weight: 2.0

### ANA-004: sysml-analyze-dependencies-001

- **Goal**: Identify import dependencies between packages
- **Source**: VehicleModel.sysml or DroneModelLogical.sysml
- **Prompt**: Create dependency graph, identify circular dependencies
- **Difficulty**: Medium, Weight: 1.5

### ANA-005: sysml-analyze-variations-001

- **Goal**: Analyze variation points and variants
- **Source**: family.sysml or create subset with variations
- **Prompt**: Identify variation points and explain differences between variants
- **Difficulty**: Hard, Weight: 2.0

### ANA-006: sysml-analyze-topology-001

- **Goal**: Analyze connection topology and patterns
- **Source**: VehicleModel.sysml connections or Fischertechnik.sysml
- **Prompt**: Identify hub components, linear chains, flow directions
- **Difficulty**: Hard, Weight: 2.5

### ANA-007: sysml-analyze-individuals-001

- **Goal**: Distinguish definitions from individual instances
- **Source**: system-of-systems.sysml or create example
- **Prompt**: Explain difference between `part def` and `individual part`
- **Difficulty**: Medium, Weight: 1.5

### ANA-008: sysml-analyze-crossref-001

- **Goal**: Trace references across multiple files
- **Source**: Multiple files (create if needed)
- **Prompt**: List all cross-file references and imports
- **Difficulty**: Hard, Weight: 2.5

## Task Directory Structure

For each task, create:

```text
data/tasks/sysml-analyze-{name}-001/
├── task.json          # Task definition
└── files/
    ├── input.sysml    # Copy relevant portion of source model
    └── README.md      # Optional notes about expected output
```

## task.json Template

```json
{
  "id": "sysml-analyze-{name}-001",
  "type": "analysis",
  "name": "Human-Readable Task Name",
  "description": "What this task tests and why it matters for MBSE",
  "prompt": "Detailed prompt with specific output format requirements...",
  "maxTokens": 2000,
  "files": {
    "initial": "files",
    "expected": []
  },
  "evaluation": {
    "type": "llm-judge",
    "criteria": ["criterion1", "criterion2", "criterion3"],
    "weight": 1.5
  }
}
```

## Evaluation Criteria by Task Type

Use these LLM judge criteria combinations:

- **Specialization (ANA-001)**: completeness, accuracy, visualization_clarity
- **Flow (ANA-002)**: flow_tracing, transformation_understanding, completeness
- **Constraints (ANA-003)**: constraint_understanding, violation_examples, clarity
- **Dependencies (ANA-004)**: dependency_identification, graph_accuracy, circular_detection
- **Variations (ANA-005)**: variation_identification, variant_description, difference_explanation
- **Topology (ANA-006)**: topology_understanding, pattern_recognition, flow_direction
- **Individuals (ANA-007)**: definition_vs_instance, relationship_understanding, sysml_v2_concepts
- **Cross-ref (ANA-008)**: cross_reference_tracing, import_understanding, completeness

## Source Models Location

Models are in `data/tasks/models/source/`:

- `VehicleModel.sysml` - Main vehicle model with parts, ports, actions, states
- `HVACSystemRequirements.sysml` - HVAC requirements with constraints
- `StopWatchStates.sysml` - State machine example

Copy only the relevant portions (50-200 lines) for each task input file.

## Guidelines

1. **Extract relevant portions** - Don't include entire 1000+ line files
2. **Use llm-judge** - All analysis tasks use LLM-based evaluation
3. **Be specific in prompts** - Define expected output format clearly
4. **Weight appropriately** - 1.5 (medium) to 2.5 (hard)
5. **Test file validity** - Ensure JSON is valid and paths exist

## Verification Commands

After implementing all tasks, run:

```bash
# Verify tests pass
bun test

# Check markdown formatting
bun run lint:md

# Check TypeScript
bun run lint
```

## Progress Tracking

Update `.plan/11-llm-implementation-guidance.md` when tasks are complete:

```markdown
- [x] ANA-001: sysml-analyze-specialization-001 (YYYY-MM-DD)
```

## Local Notes

Use `.plan/local/` for your working notes - this folder is not committed to git.
