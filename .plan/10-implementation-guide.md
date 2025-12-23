# Implementation Guide

## Overview

This guide provides step-by-step instructions for implementing the SysML v2 benchmark tasks.

## Prerequisites

1. Clone the GfSE/SysML-v2-Models repository:

   ```bash
   git clone https://github.com/GfSE/SysML-v2-Models.git /tmp/sysml-models
   ```

2. Ensure the benchmark framework is set up:

   ```bash
   bun install
   bun test
   ```

## Phase 1: Validators (Week 1)

### Step 1.1: Create Validator Directory Structure

```bash
mkdir -p src/evaluation/validators
```

### Step 1.2: Implement SysML Syntax Validator

Create `src/evaluation/validators/sysml-syntax.ts`:

- [ ] Define validation result types
- [ ] Implement brace matching
- [ ] Implement keyword validation
- [ ] Implement basic structure validation
- [ ] Add tests

### Step 1.3: Implement Component Extractor

Create `src/evaluation/validators/sysml-extractor.ts`:

- [ ] Define extraction types
- [ ] Implement regex-based extraction
- [ ] Implement comparison functions
- [ ] Add tests

### Step 1.4: Implement Semantic Comparator

Create `src/evaluation/validators/sysml-semantic.ts`:

- [ ] Define comparison result types
- [ ] Create LLM prompt templates
- [ ] Implement equivalence checking
- [ ] Add tests

### Step 1.5: Register New Evaluation Strategies

Update `src/evaluation/strategies/index.ts`:

- [ ] Export sysml-validation strategy
- [ ] Register in strategy factory

## Phase 2: Task Data Preparation (Week 2)

### Step 2.1: Copy Source Models

```bash
# Create directory structure
mkdir -p data/tasks/models/source

# Copy relevant models
cp /tmp/sysml-models/models/SE_Models/*.sysml data/tasks/models/source/
cp /tmp/sysml-models/models/example_family/*.sysml data/tasks/models/source/
cp /tmp/sysml-models/models/example_sos/*.sysml data/tasks/models/source/
cp /tmp/sysml-models/models/example_contribution/*.sysml data/tasks/models/source/
```

### Step 2.2: Create Invalid Model Variants

For validation tasks, create modified versions:

```bash
mkdir -p data/tasks/models/invalid
```

Generate:

- [ ] Missing brace variants
- [ ] Invalid keyword variants
- [ ] Undefined reference variants
- [ ] Malformed expression variants

### Step 2.3: Attribution

Create `data/tasks/models/LICENSE.md`:

```markdown
# Model Attribution

Models in this directory are derived from:
- Repository: https://github.com/GfSE/SysML-v2-Models
- License: BSD 3-Clause
- Copyright: 2024 Gesellschaft für Systems Engineering e.V.

Used with permission under BSD 3-Clause License terms.
```

## Phase 3: Task Implementation (Weeks 3-4)

### Task Directory Structure

For each task:

```text
data/tasks/{task-id}/
├── task.json          # Task definition
└── files/             # Input files for the task
    ├── input.sysml    # Primary input model
    └── ...            # Additional files as needed
```

### Implementation Order

#### Week 3: Easy/Medium Tasks

1. VAL-001, VAL-002, VAL-003 (Validation)
2. EXT-001, EXT-002, EXT-003 (Extraction)
3. GEN-001, GEN-002 (Generation - Simple)

#### Week 4: Medium/Hard Tasks

1. ANA-001, ANA-002, ANA-003 (Analysis)
2. REQ-001, REQ-002 (Requirements)
3. STM-001, STM-002 (State Machines)

#### Week 5: Hard/Expert Tasks

1. GEN-004, GEN-005, GEN-006 (Generation - Complex)
2. TRN-001, TRN-002, TRN-003 (Transformation)
3. ADV-001, ADV-002, ADV-003 (Advanced)

### Task JSON Template

```json
{
  "id": "{task-id}",
  "type": "qa|analysis|generation",
  "name": "Human-readable task name",
  "description": "Detailed description of what the task tests",
  "prompt": "The exact prompt given to the AI model",
  "maxTokens": 2000,
  "files": {
    "initial": "files",
    "expected": [
      {
        "path": "output.sysml",
        "validation": {
          "type": "sysml-valid",
          "value": true
        }
      }
    ]
  },
  "evaluation": {
    "type": "sysml-validation|llm-judge|element-extraction|combined",
    "weight": 1.0,
    "criteria": ["criterion1", "criterion2"]
  }
}
```

## Phase 4: Testing & Validation (Week 6)

### Step 4.1: Run All Tasks Against Test Model

```bash
bun run bench --model test-model --all
```

### Step 4.2: Verify Evaluation Results

- [ ] Check that valid responses score high
- [ ] Check that invalid responses score low
- [ ] Verify LLM judge consistency
- [ ] Test edge cases

### Step 4.3: Calibrate Weights

Adjust task weights based on:

- Difficulty level
- Importance to overall benchmark
- Score distribution

## Phase 5: Documentation (Week 7)

### Step 5.1: Update Task Registry

Update `data/tasks/index.json`:

```json
{
  "version": "1.0.0",
  "tasks": [
    "sysml-valid-detection-001",
    "sysml-invalid-braces-001",
    "..."
  ],
  "categories": {
    "validation": ["sysml-valid-detection-001", "..."],
    "extraction": ["sysml-extract-parts-001", "..."],
    "..."
  }
}
```

### Step 5.2: Update README

Document:

- New task categories
- SysML v2 specific features
- Model sources and attribution

### Step 5.3: Create Task Documentation

For each category, create documentation explaining:

- What skills are tested
- How to interpret results
- Common failure modes

## Checklist

### Validators

- [ ] sysml-syntax.ts implemented
- [ ] sysml-extractor.ts implemented
- [ ] sysml-semantic.ts implemented
- [ ] sysml-structure.ts implemented
- [ ] All validators have tests
- [ ] Validators registered in evaluation system

### Tasks

- [ ] 6 validation tasks created
- [ ] 8 extraction tasks created
- [ ] 8 analysis tasks created
- [ ] 14 generation tasks created
- [ ] 5 transformation tasks created
- [ ] 5 requirements tasks created
- [ ] 3 state machine tasks created
- [ ] 3 advanced tasks created
- [ ] All tasks have test files
- [ ] All tasks pass validation

### Documentation

- [ ] README updated
- [ ] Task index updated
- [ ] Attribution complete
- [ ] Category documentation complete

## Success Criteria

1. All 59 tasks are runnable
2. Validators correctly identify valid/invalid SysML v2
3. Extraction tasks return structured data
4. LLM judge provides consistent evaluations
5. Results are reproducible across runs
