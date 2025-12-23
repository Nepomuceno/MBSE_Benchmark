# SysML v2 Benchmark Tasks - Implementation Plan

## Overview

This plan defines **45 benchmark tasks** for evaluating AI models on SysML v2 understanding, generation, analysis, and transformation capabilities. Tasks are based on models from the [GfSE/SysML-v2-Models](https://github.com/GfSE/SysML-v2-Models) repository (BSD 3-Clause License, compatible with MIT).

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

New validators to implement (see 09-validators.md):

1. **SysML v2 Syntax Validator** - Check if output is valid SysML v2
2. **Component Extractor** - Parse and extract SysML v2 elements
3. **Semantic Comparator** - Compare model semantics (with LLM assist)
4. **Structure Matcher** - Compare component hierarchies

## Implementation Priority

1. Validators (foundation for all tasks)
2. Extraction tasks (simpler, deterministic)
3. Analysis tasks (require understanding)
4. Validation tasks (syntax checking)
5. Generation tasks (complex, need LLM judge)
6. Transformation tasks (complex)
7. State machine tasks
8. Advanced tasks

## LLM Implementation Guidance

See [11-llm-implementation-guidance.md](./11-llm-implementation-guidance.md) for:

- Progress tracking checklists
- Best practices for task implementation
- Prompt writing guidelines
- Evaluation configuration patterns
- Common pitfalls to avoid

## Task Count Summary

| Category       | Count  |
| -------------- | ------ |
| Validation     | 6      |
| Extraction     | 8      |
| Analysis       | 8      |
| Generation     | 14     |
| Transformation | 12     |
| Requirements   | 5      |
| State Machines | 3      |
| Advanced       | 3      |
| **Total**      | **59** |
