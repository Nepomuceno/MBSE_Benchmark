# SysML v2 Transformation Tasks Implementation

You are implementing the Transformation benchmark tasks (TRN-001 to TRN-012) for
the MBSE Benchmark project. This is a self-contained prompt with all context.

## Project Overview

**Repository**: MBSE Benchmark - A framework for evaluating AI models on
Model-Based Systems Engineering tasks, focusing on SysML v2.

**Your Task**: Implement 12 transformation tasks that test an AI's ability to
transform SysML v2 models between representations or refactor them.

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
    ├── 05-transformation.md  # Detailed task specifications
    └── local/                # Your working notes (not committed)
```

## Tasks to Implement

Create these 12 transformation tasks in `data/tasks/`:

### Documentation Transformations

#### TRN-001: sysml-transform-todoc-001

- **Goal**: Transform SysML v2 model to structured documentation
- **Source**: VehicleModel.sysml subset (50-100 lines)
- **Output**: Markdown with System Overview, Components, Interfaces, Attributes
- **Difficulty**: Medium, Weight: 2.0

#### TRN-010: sysml-transform-enrich-001

- **Goal**: Enrich model with documentation and metadata
- **Source**: Minimal model without docs
- **Output**: Same structure with doc strings, comments, default values
- **Difficulty**: Medium, Weight: 1.5

### Code Transformations

#### TRN-005: sysml-transform-notation-001

- **Goal**: Translate SysML v2 to JSON Schema
- **Source**: Metamodel.sysml or subset
- **Mapping**: part def → object, attributes → properties, :> → allOf
- **Difficulty**: Hard, Weight: 3.0

#### TRN-006: sysml-transform-plantuml-001

- **Goal**: Transform SysML v2 to PlantUML diagram
- **Source**: system-of-systems.sysml or subset
- **Output**: PlantUML code with classes, inheritance, composition
- **Difficulty**: Medium, Weight: 2.0

#### TRN-007: sysml-transform-typescript-001

- **Goal**: Transform SysML v2 part definitions to TypeScript interfaces
- **Source**: CalculationExample.sysml or subset
- **Mapping**: part def → interface, attributes → properties, :> → extends
- **Difficulty**: Medium, Weight: 2.0

#### TRN-008: sysml-transform-statemachine-001

- **Goal**: Transform state machine to executable TypeScript
- **Source**: StopWatchStates.sysml
- **Output**: TypeScript class with state enum, transitions, handlers
- **Difficulty**: Hard, Weight: 3.0

### Model Refactoring

#### TRN-002: sysml-transform-req2model-001

- **Goal**: Transform natural language requirements to SysML v2
- **Source**: requirements.md document (create with 5-10 requirements)
- **Output**: SysML v2 requirements package with constraints
- **Difficulty**: Hard, Weight: 2.5

#### TRN-003: sysml-transform-refactor-001

- **Goal**: Extract port definitions into separate package
- **Source**: VehicleModel.sysml subset with port defs
- **Output**: Two packages with proper imports
- **Difficulty**: Medium, Weight: 2.0

#### TRN-004: sysml-transform-simplify-001

- **Goal**: Create simplified "black box" version
- **Source**: DroneModelLogical.sysml or VehicleModel.sysml subset
- **Output**: Only top-level defs and external interfaces
- **Difficulty**: Medium, Weight: 2.0

#### TRN-009: sysml-transform-decompose-001

- **Goal**: Decompose monolithic model into packages
- **Source**: Single-package model (family.sysml or create)
- **Output**: Definitions, Actions, Constraints, Model packages with imports
- **Difficulty**: Medium, Weight: 2.5

### Advanced Transformations

#### TRN-011: sysml-transform-req2test-001

- **Goal**: Transform requirements to verification cases
- **Source**: HVACSystemRequirements.sysml
- **Output**: Verification cases with setup, procedure, criteria, verify link
- **Difficulty**: Hard, Weight: 3.0

#### TRN-012: sysml-transform-migrate-001

- **Goal**: Migrate model patterns to modern conventions
- **Source**: Model with old patterns (create)
- **Output**: Updated patterns (interface defs, bind, port conjugation)
- **Difficulty**: Hard, Weight: 2.5

## Task Directory Structure

Transformation tasks need input files:

```text
data/tasks/sysml-transform-{name}-001/
├── task.json
└── files/
    ├── input.sysml           # Source model
    ├── requirements.md       # For req2model (TRN-002)
    └── README.md             # Expected output notes
```

## task.json Template

```json
{
  "id": "sysml-transform-{name}-001",
  "type": "generation",
  "name": "Human-Readable Task Name",
  "description": "What this transformation tests",
  "prompt": "Transform this SysML v2 model into [target format]...\n\nMapping rules:\n1. ...\n\nPreserve all semantic information.",
  "maxTokens": 3000,
  "files": {
    "initial": "files",
    "expected": []
  },
  "evaluation": {
    "type": "combined",
    "strategies": [
      {"type": "llm-judge", "weight": 1.0, "criteria": ["semantic_preservation", "format_validity", "completeness"]}
    ]
  }
}
```

## Evaluation Strategies

### For SysML Output (refactoring)

```json
{
  "evaluation": {
    "type": "combined",
    "strategies": [
      {"type": "sysml-validation", "weight": 0.3},
      {"type": "llm-judge", "weight": 0.7, "criteria": ["semantic_preservation", "structure", "imports"]}
    ]
  }
}
```

### For Non-SysML Output (code, docs)

```json
{
  "evaluation": {
    "type": "llm-judge",
    "criteria": ["format_validity", "semantic_mapping", "completeness"],
    "weight": 2.5
  }
}
```

## Input File Preparation

For each task, prepare appropriate input:

| Task    | Input File                                         |
| ------- | -------------------------------------------------- |
| TRN-001 | 50-100 lines from VehicleModel.sysml               |
| TRN-002 | Create requirements.md with 5-10 NL requirements   |
| TRN-003 | Subset with 3-5 port definitions                   |
| TRN-004 | Subset with nested structure to simplify           |
| TRN-005 | Small metamodel or type hierarchy                  |
| TRN-006 | Small model with clear relationships               |
| TRN-007 | Part defs with attributes and specialization       |
| TRN-008 | StopWatchStates.sysml (full or subset)             |
| TRN-009 | Single-package model with mixed element types      |
| TRN-010 | Minimal model without documentation                |
| TRN-011 | HVACSystemRequirements.sysml subset                |
| TRN-012 | Model with intentionally old patterns              |

## Source Models Location

Models are in `data/tasks/models/source/`:

- `VehicleModel.sysml` - Comprehensive vehicle model
- `HVACSystemRequirements.sysml` - Requirements with constraints
- `StopWatchStates.sysml` - State machine
- `Metamodel.sysml` - Type definitions

## Prompt Writing for Transformations

**Good Prompt Example:**

```text
Transform this SysML v2 model into a PlantUML class diagram.

Mapping rules:
1. Each 'part def' becomes a PlantUML class
2. Specialization (:>) becomes inheritance arrow (<|--)
3. Part usages become composition (o--)
4. Attributes become class members with types
5. Add <<part def>> stereotype to each class

The PlantUML should render a clear architecture diagram.

Output only valid PlantUML code starting with @startuml.
```

## Guidelines

1. **Prepare appropriate inputs** - Copy/create relevant source files
2. **Focus on semantic preservation** - Key criterion for transformations
3. **Weight by complexity** - 2.0-3.0 for most transformations
4. **Consider bidirectional validation** - Input valid → output valid
5. **Handle multiple output files** - Some refactoring produces multiple files

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
- [x] TRN-001: sysml-transform-todoc-001 (YYYY-MM-DD)
```

## Local Notes

Use `.plan/local/` for your working notes - this folder is not committed to git.
