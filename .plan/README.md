# SysML v2 Benchmark Tasks - Implementation Plan

## Overview

This plan defines **59 benchmark tasks** for evaluating AI models on SysML v2
understanding, generation, analysis, and transformation capabilities. Tasks are
based on models from the
[GfSE/SysML-v2-Models](https://github.com/GfSE/SysML-v2-Models) repository
(BSD 3-Clause License, compatible with MIT).

## Folder Structure

```text
.plan/
├── README.md                    # This file
├── 01-validation.md             # Validation task specs (6 tasks) ✅
├── 02-extraction.md             # Extraction task specs (8 tasks) ✅
├── 03-analysis.md               # Analysis task specs (8 tasks)
├── 04-generation.md             # Generation task specs (14 tasks)
├── 05-transformation.md         # Transformation task specs (12 tasks)
├── 06-requirements.md           # Requirements task specs (5 tasks)
├── 07-states.md                 # State machine task specs (3 tasks)
├── 08-advanced.md               # Advanced task specs (3 tasks)
├── 09-validators.md             # Validator implementation specs
├── 10-implementation-guide.md   # Step-by-step guide
├── 11-llm-implementation-guidance.md  # Progress tracking
├── prompts/                     # Independent prompts for each category
│   ├── README.md
│   ├── prompt-analysis.md       # Self-contained prompt for analysis tasks
│   ├── prompt-generation.md     # Self-contained prompt for generation tasks
│   ├── prompt-transformation.md # Self-contained prompt for transformation tasks
│   ├── prompt-requirements.md   # Self-contained prompt for requirements tasks
│   ├── prompt-state-machine.md  # Self-contained prompt for state tasks
│   └── prompt-advanced.md       # Self-contained prompt for advanced tasks
└── local/                       # Agent-specific notes (not committed)
    └── README.md
```

## Implementation Status

| Category       | Tasks | Status     | Prompt                      |
| -------------- | ----- | ---------- | --------------------------- |
| Validation     | 6     | ✅ Done    | -                           |
| Extraction     | 8     | ✅ Done    | -                           |
| Analysis       | 8     | ⬜ Pending | `prompts/prompt-analysis.md`|
| Generation     | 14    | ⬜ Pending | `prompts/prompt-generation.md`|
| Transformation | 12    | ⬜ Pending | `prompts/prompt-transformation.md`|
| Requirements   | 5     | ⬜ Pending | `prompts/prompt-requirements.md`|
| State Machines | 3     | ⬜ Pending | `prompts/prompt-state-machine.md`|
| Advanced       | 3     | ⬜ Pending | `prompts/prompt-advanced.md`|
| **Total**      | **59**|            |                             |

## How to Use (for AI Agents)

1. **Pick your category** from the table above
2. **Read the prompt file** in `prompts/` for your category
3. **Each prompt is independent** - contains all context needed
4. **Use `local/` folder** for your working notes (not committed to git)
5. **Update progress** in `11-llm-implementation-guidance.md` when done

## License Compatibility

- **Source**: GfSE/SysML-v2-Models - BSD 3-Clause License
- **Target**: MBSE Benchmark - MIT License
- **Status**: ✅ Compatible - BSD 3-Clause allows redistribution and use with attribution

## Model Sources

Models are sourced from:

- `models/SE_Models/` - Vehicle, Drone, HVAC, Stopwatch, etc.
- `models/example_family/` - Family relationship modeling
- `models/example_sos/` - System of Systems
- `models/example_EveOnlineMiningFrigate/` - Gaming domain model
- `models/example_contribution/` - Calculation examples

## Task Categories

### Category 1: SysML v2 Syntax Validation (01-validation.md)

Tasks to validate if AI can recognize valid/invalid SysML v2 syntax.

### Category 2: Component Extraction (02-extraction.md)

Tasks to extract structured information from SysML v2 models.

### Category 3: Model Analysis (03-analysis.md)

Tasks to analyze relationships, hierarchies, and semantics.

### Category 4: Model Generation (04-generation.md)

Tasks to generate SysML v2 models from requirements.

### Category 5: Model Transformation (05-transformation.md)

Tasks to transform between model representations.

### Category 6: Requirement Traceability (06-requirements.md)

Tasks involving requirements and their satisfaction.

### Category 7: State Machine Understanding (07-states.md)

Tasks focused on state definitions and transitions.

### Category 8: Advanced Semantic Analysis (08-advanced.md)

Complex tasks requiring deep SysML v2 understanding.

## Validators

Validators are already implemented in `src/evaluation/validators/`:

1. **SysML v2 Syntax Validator** ✅ - Check if output is valid SysML v2
2. **Component Extractor** ✅ - Parse and extract SysML v2 elements
3. **Structure Matcher** ✅ - Compare component hierarchies
4. **Semantic Comparator** ⬜ - Compare model semantics (deferred)

## License Compatibility

- **Source**: GfSE/SysML-v2-Models - BSD 3-Clause License
- **Target**: MBSE Benchmark - MIT License
- **Status**: ✅ Compatible - BSD 3-Clause allows redistribution with attribution
