# SysML v2 Benchmark - Continuation Prompt

Use this prompt to continue implementation in a new session.

---

## Prompt for Next Session

```text
I need you to continue implementing SysML v2 benchmark tasks for the MBSE Benchmark project.

## Context

This project is located at /Users/ganepomu/projects/github.com/Nepomuceno/mbse_benchmark

## What Was Completed

### Phase 1: Validators ✅
All validators implemented and tested (233 tests passing):
- SysML Syntax Validator
- Component Extractor
- Structure Matcher
- Evaluation Strategy

### Phase 2: Source Data Preparation ✅
- GfSE models copied to `data/tasks/models/source/`
  - VehicleModel.sysml
  - StopWatchStates.sysml
  - HVACSystemRequirements.sysml
  - Metamodel.sysml
- Invalid variants in `data/tasks/models/invalid/`
- BSD-3 license attribution

### Phase 3: Validation Tasks (VAL-001 to VAL-006) ✅
All 6 validation tasks implemented:
- sysml-valid-detection-001
- sysml-invalid-braces-001
- sysml-invalid-keywords-001
- sysml-mixed-validation-001
- sysml-semantic-validity-001
- sysml-constraint-syntax-001

## What's Next: Extraction Tasks (EXT-001 to EXT-008)

See `.plan/02-extraction.md` for specifications:

1. EXT-001: sysml-extract-parts-001 - Extract part definitions
2. EXT-002: sysml-extract-ports-001 - Extract port definitions
3. EXT-003: sysml-extract-requirements-001 - Extract requirements
4. EXT-004: sysml-extract-connections-001 - Extract connections
5. EXT-005: sysml-extract-hierarchy-001 - Extract hierarchical structure
6. EXT-006: sysml-extract-attributes-001 - Extract attributes
7. EXT-007: sysml-extract-actions-001 - Extract actions
8. EXT-008: sysml-extract-interfaces-001 - Extract interfaces

## Key Files

- `.plan/README.md` - Overview of all 59 tasks
- `.plan/11-llm-implementation-guidance.md` - Progress tracking
- `.plan/02-extraction.md` - Extraction task specifications
- `data/tasks/models/source/` - Valid GfSE models for extraction

## Guidelines

- Use Bun for all package management and testing
- Import from `bun:test` for tests
- Source models from GfSE repository (BSD-3 license)
- Run `bun test` and `bun run lint` to validate changes

## Quick Verification

Run this to verify everything is working:

```bash
bun test && bun run lint
```

---

## Files Summary

| File                                             | Status              |
| ------------------------------------------------ | ------------------- |
| `src/evaluation/validators/sysml-syntax.ts`      | ✅ Complete         |
| `src/evaluation/validators/sysml-extractor.ts`   | ✅ Complete         |
| `src/evaluation/validators/sysml-structure.ts`   | ✅ Complete         |
| `src/evaluation/validators/index.ts`             | ✅ Complete         |
| `src/evaluation/strategies/sysml-validation.ts`  | ✅ Complete         |
| `src/evaluation/validators/integration.test.ts`  | ✅ Complete         |
| `data/tasks/models/source/`                      | ✅ GfSE models      |
| `data/tasks/models/invalid/`                     | ✅ Invalid variants |
| `data/tasks/sysml-valid-detection-001/`          | ✅ VAL-001          |
| `data/tasks/sysml-invalid-braces-001/`           | ✅ VAL-002          |
| `data/tasks/sysml-invalid-keywords-001/`         | ✅ VAL-003          |
| `data/tasks/sysml-mixed-validation-001/`         | ✅ VAL-004          |
| `data/tasks/sysml-semantic-validity-001/`        | ✅ VAL-005          |
| `data/tasks/sysml-constraint-syntax-001/`        | ✅ VAL-006          |
| `.plan/11-llm-implementation-guidance.md`        | ✅ Updated          |
