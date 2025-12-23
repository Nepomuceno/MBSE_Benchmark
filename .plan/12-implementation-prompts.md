# Implementation Prompts for Unimplemented Task Categories

This document contains comprehensive prompts for AI agents to implement each
remaining category of SysML v2 benchmark tasks. Copy the relevant prompt into
a new session to continue development.

## Overview of Implementation Status

### Completed Categories

- **Validation Tasks (VAL-001 to VAL-006)**: All 6 tasks implemented
- **Extraction Tasks (EXT-001 to EXT-008)**: All 8 tasks implemented
- **Validators**: sysml-syntax, sysml-extractor, sysml-structure implemented

### Pending Categories

- **Analysis Tasks (ANA-001 to ANA-008)**: 8 tasks pending
- **Generation Tasks (GEN-001 to GEN-014)**: 14 tasks pending
- **Transformation Tasks (TRN-001 to TRN-012)**: 12 tasks pending
- **Requirements Tasks (REQ-001 to REQ-005)**: 5 tasks pending
- **State Machine Tasks (STM-001 to STM-003)**: 3 tasks pending
- **Advanced Tasks (ADV-001 to ADV-003)**: 3 tasks pending

---

## Prompt 1: Analysis Tasks

Copy this prompt to implement the 8 analysis tasks (ANA-001 to ANA-008):

> I need you to implement the SysML v2 Analysis benchmark tasks for the MBSE
> Benchmark project located at this repository.
>
> See `.plan/03-analysis.md` for full specifications. Implement these 8 tasks:
>
> - ANA-001: sysml-analyze-specialization-001 - Identify specialization
> - ANA-002: sysml-analyze-flow-001 - Trace data/material flow
> - ANA-003: sysml-analyze-constraints-001 - Analyze constraint implications
> - ANA-004: sysml-analyze-dependencies-001 - Package dependency graph
> - ANA-005: sysml-analyze-variations-001 - Analyze variation points
> - ANA-006: sysml-analyze-topology-001 - Connection topology analysis
> - ANA-007: sysml-analyze-individuals-001 - Definition vs instance distinction
> - ANA-008: sysml-analyze-crossref-001 - Cross-file reference tracing
>
> For each task create `data/tasks/{task-id}/task.json` with `type: analysis`
> and `evaluation.type: llm-judge`. Copy relevant source model sections to
> `files/input.sysml`. Use weight 1.5-2.5 based on difficulty.
>
> After implementation, run `bun test`, `bun run lint:md`, and update the
> checklist in `.plan/11-llm-implementation-guidance.md`.

---

## Prompt 2: Generation Tasks

Copy this prompt to implement the 14 generation tasks (GEN-001 to GEN-014):

> I need you to implement the SysML v2 Generation benchmark tasks for the MBSE
> Benchmark project located at this repository.
>
> See `.plan/04-generation.md` for full specifications. Implement these tasks:
>
> Easy (weight 1.0-1.5):
>
> - GEN-001: sysml-generate-part-001 - Simple part definition
> - GEN-009: sysml-generate-constraints-001 - Physics constraint definitions
>
> Medium (weight 1.5-2.0):
>
> - GEN-002: sysml-generate-ports-001 - Ports and interfaces
> - GEN-003: sysml-generate-requirements-001 - Requirements from NL
> - GEN-005: sysml-generate-actions-001 - Action definitions
> - GEN-008: sysml-generate-usecase-001 - Use case definitions
> - GEN-010: sysml-generate-calc-001 - Calculation definitions
> - GEN-013: sysml-generate-individual-001 - Individual definitions
> - GEN-014: sysml-generate-messages-001 - Signal/message definitions
>
> Hard (weight 2.0-3.0):
>
> - GEN-004: sysml-generate-states-001 - State machine
> - GEN-006: sysml-generate-subsystem-001 - Complete subsystem
> - GEN-007: sysml-generate-variation-001 - Specialization/variation
> - GEN-011: sysml-generate-connections-001 - Connection topology
> - GEN-012: sysml-generate-analysis-001 - Analysis case
>
> For generation tasks use `type: generation` with combined evaluation
> (sysml-validation + llm-judge). No input files needed. Prompts must specify
> exact expected output format.
>
> After implementation, run `bun test`, `bun run lint:md`, and update the
> checklist in `.plan/11-llm-implementation-guidance.md`.

---

## Prompt 3: Transformation Tasks

Copy this prompt to implement the 12 transformation tasks (TRN-001 to TRN-012):

> I need you to implement the SysML v2 Transformation benchmark tasks for the
> MBSE Benchmark project located at this repository.
>
> See `.plan/05-transformation.md` for full specifications. Implement:
>
> Documentation transforms:
>
> - TRN-001: sysml-transform-todoc-001 - Model to markdown documentation
> - TRN-010: sysml-transform-enrich-001 - Add documentation to model
>
> Code transforms:
>
> - TRN-005: sysml-transform-notation-001 - SysML to JSON Schema
> - TRN-006: sysml-transform-plantuml-001 - SysML to PlantUML
> - TRN-007: sysml-transform-typescript-001 - SysML to TypeScript interfaces
> - TRN-008: sysml-transform-statemachine-001 - State machine to TS code
>
> Model refactoring:
>
> - TRN-002: sysml-transform-req2model-001 - NL requirements to SysML
> - TRN-003: sysml-transform-refactor-001 - Extract to separate package
> - TRN-004: sysml-transform-simplify-001 - Create black box version
> - TRN-009: sysml-transform-decompose-001 - Split into multiple packages
>
> Advanced transforms:
>
> - TRN-011: sysml-transform-req2test-001 - Requirements to verification
> - TRN-012: sysml-transform-migrate-001 - Pattern migration
>
> Transformation tasks need input files. Use combined evaluation with
> semantic_preservation as a key criterion. Weight 2.0-3.0.
>
> After implementation, run `bun test`, `bun run lint:md`, and update the
> checklist in `.plan/11-llm-implementation-guidance.md`.

---

## Prompt 4: Requirements Tasks

Copy this prompt to implement the 5 requirements tasks (REQ-001 to REQ-005):

> I need you to implement the SysML v2 Requirements Traceability tasks for the
> MBSE Benchmark project located at this repository.
>
> See `.plan/06-requirements.md` for full specifications. Implement:
>
> - REQ-001: sysml-req-satisfaction-001 - Identify satisfy relationships
> - REQ-002: sysml-req-coverage-001 - Requirement coverage analysis
> - REQ-003: sysml-req-constraint-001 - Verify constraint with calculations
> - REQ-004: sysml-req-derivation-001 - Derive component requirements
> - REQ-005: sysml-req-impact-001 - Requirement change impact analysis
>
> REQ-003 requires calculation: Extract mass values from VehicleModel.sysml,
> sum them, and compare against the 2000kg constraint. Expected result: FAILS
> (calculated ~2210kg > 2000kg limit).
>
> Use llm-judge evaluation with criteria like relationship_identification,
> calculation_accuracy, trace_completeness. Weight 2.0-3.0.
>
> After implementation, run `bun test`, `bun run lint:md`, and update the
> checklist in `.plan/11-llm-implementation-guidance.md`.

---

## Prompt 5: State Machine Tasks

Copy this prompt to implement the 3 state machine tasks (STM-001 to STM-003):

> I need you to implement the SysML v2 State Machine tasks for the MBSE
> Benchmark project located at this repository.
>
> See `.plan/07-states.md` for full specifications. Implement:
>
> - STM-001: sysml-state-extraction-001 - Extract states and transitions
>   - Source: StopWatchStates.sysml
>   - Output: state list, transition table, ASCII diagram
>   - States: ready, running, paused, stopped
>
> - STM-002: sysml-state-complex-001 - Analyze parallel states and actions
>   - Source: VehicleModel.sysml (vehicleStates section)
>   - Analyze parallel regions, entry/exit actions, guards, do activities
>
> - STM-003: sysml-state-compare-001 - Compare two state machines
>   - Create two versions with differences
>   - Determine behavioral equivalence
>   - Provide differing scenario if not equivalent
>
> Use combined evaluation with element-extraction for state names and
> llm-judge for diagram quality. Weight 2.0-3.0.
>
> After implementation, run `bun test`, `bun run lint:md`, and update the
> checklist in `.plan/11-llm-implementation-guidance.md`.

---

## Prompt 6: Advanced Tasks

Copy this prompt to implement the 3 advanced tasks (ADV-001 to ADV-003):

> I need you to implement the SysML v2 Advanced Semantic Analysis tasks for
> the MBSE Benchmark project located at this repository.
>
> See `.plan/08-advanced.md` for full specifications. Implement:
>
> - ADV-001: sysml-advanced-quality-001 - Model quality assessment
>   - Score 1-5 on: naming, documentation, modularity, completeness, complexity
>   - Provide justification and recommendations for each
>
> - ADV-002: sysml-advanced-patterns-001 - Identify modeling patterns
>   - Find: Definition-Usage, Layered architecture, Interface segregation,
>     Variation points, Requirements allocation patterns
>   - Explain each pattern's implementation and benefits
>
> - ADV-003: sysml-advanced-merge-001 - Merge two partial models
>   - Create structural and behavioral partial models
>   - Merge resolving conflicts, connecting elements, adding imports
>   - Document assumptions
>
> These are expert-level tasks. Use llm-judge with weight 3.0+. For ADV-003
> add sysml-validation to verify merged output is valid.
>
> After implementation, run `bun test`, `bun run lint:md`, and update the
> checklist in `.plan/11-llm-implementation-guidance.md`.

---

## Quick Reference

### Task ID Patterns

| Category       | Pattern                    |
| -------------- | -------------------------- |
| Analysis       | sysml-analyze-{name}-001   |
| Generation     | sysml-generate-{name}-001  |
| Transformation | sysml-transform-{name}-001 |
| Requirements   | sysml-req-{name}-001       |
| State Machine  | sysml-state-{name}-001     |
| Advanced       | sysml-advanced-{name}-001  |

### Verification Commands

```bash
bun test                        # Run all tests
bun run lint:md .plan/*.md      # Lint .plan markdown files
bun run lint                    # Lint TypeScript
bun run typecheck               # Type check
```

### After Each Category

1. Run `bun test` - all tests pass
2. Run `bun run lint:md .plan/*.md` - no markdown errors
3. Update `.plan/11-llm-implementation-guidance.md` checklist
4. Commit with message like: `feat(tasks): add ANA analysis tasks`
