# SysML v2 Langium Parser - Future Implementation Plan

## Overview

The current SysML v2 validators use regex-based parsing, which is sufficient for benchmark evaluation but not for production-grade syntax validation. This document outlines the plan for implementing a proper Langium-based parser.

## Why Langium?

- **MIT License** - Fully compatible with this project's MIT license
- **TypeScript native** - No Java/Eclipse dependencies
- **Language Server Protocol** - Built-in LSP support for IDE integration
- **Modern tooling** - Active development, good documentation
- **Proven for SysML v2** - Used by Sensmetry's sysml-2ls (though their implementation is GPL)

## Current State

### What We Have (Regex-Based)

- `src/evaluation/validators/sysml-syntax.ts` - Basic syntax validation
- `src/evaluation/validators/sysml-extractor.ts` - Component extraction

### Limitations

- No proper AST generation
- Cannot validate semantic correctness
- Limited error recovery
- No cross-reference resolution
- Cannot validate constraint expressions

## Implementation Plan

### Phase 1: Setup Langium Infrastructure

```bash
bun add langium langium-cli
```

#### Tasks

- [ ] Initialize Langium project structure
- [ ] Configure langium-config.json
- [ ] Set up grammar file location (`src/language/sysml.langium`)
- [ ] Configure AST type generation

### Phase 2: KerML Grammar (Foundation)

SysML v2 is built on KerML (Kernel Modeling Language). We need to implement KerML first.

#### Core KerML Elements

```langium
// Example structure - actual grammar will be more complex
grammar KerML

entry Model:
    (elements+=Element)*;

Element:
    Namespace | Type | Feature | Relationship;

Namespace:
    'package' name=ID '{' (members+=Member)* '}';

Type:
    Classifier | DataType;

Classifier:
    'part' 'def' name=ID (specialization=Specialization)? 
    ('{' (features+=Feature)* '}')?;
```

#### Tasks

- [ ] Define core namespace elements
- [ ] Define type system (Classifier, DataType, etc.)
- [ ] Define feature elements (attributes, references)
- [ ] Define relationship elements
- [ ] Define expression grammar

### Phase 3: SysML v2 Grammar (Extension)

Extend KerML with SysML-specific constructs.

#### SysML Elements

```langium
// SysML extends KerML
grammar SysML extends KerML

// Part definitions
PartDef:
    'part' 'def' name=ID (specialization=Specialization)?
    ('{' (members+=PartMember)* '}')?;

// Port definitions
PortDef:
    'port' 'def' name=ID
    ('{' (members+=PortMember)* '}')?;

// Requirements
RequirementDef:
    'requirement' 'def' ('<' id=STRING '>')? name=ID
    ('{' (members+=RequirementMember)* '}')?;

// State machines
StateDef:
    'state' 'def' name=ID
    ('{' (states+=State | transitions+=Transition)* '}')?;
```

#### Tasks

- [ ] Part and part def grammar
- [ ] Port and port def grammar
- [ ] Attribute grammar
- [ ] Connection grammar
- [ ] Requirement grammar
- [ ] State machine grammar
- [ ] Action grammar
- [ ] Constraint/calc grammar
- [ ] Use case grammar
- [ ] Allocation grammar

### Phase 4: Validation Rules

Implement semantic validation beyond syntax.

#### Tasks

- [ ] Type checking
- [ ] Reference resolution
- [ ] Multiplicity validation
- [ ] Constraint expression validation
- [ ] Circular reference detection
- [ ] Import resolution

### Phase 5: Integration

Replace regex validators with Langium parser.

#### Tasks

- [ ] Create parser service wrapper
- [ ] Update `sysml-syntax.ts` to use Langium
- [ ] Update `sysml-extractor.ts` to walk AST
- [ ] Add proper error messages with line/column
- [ ] Maintain backward compatibility with existing tests

## Resources

### Official References

- [SysML v2 Specification](https://www.omg.org/spec/SysML/2.0)
- [KerML Specification](https://www.omg.org/spec/KerML/1.0)
- [SysML v2 Pilot Implementation Grammar](https://github.com/Systems-Modeling/SysML-v2-Pilot-Implementation) (LGPL - reference only)

### Langium Resources

- [Langium Documentation](https://langium.org/docs/)
- [Langium GitHub](https://github.com/eclipse-langium/langium) (MIT License)
- [Langium Playground](https://langium.org/playground/)

### Example Langium Projects

- [Langium examples](https://github.com/eclipse-langium/langium/tree/main/examples)
- [MiniLogo tutorial](https://langium.org/tutorials/building_an_extension/)

## Estimated Effort

| Phase | Complexity | Estimated Time |
|-------|------------|----------------|
| Phase 1: Setup | Low | 1-2 days |
| Phase 2: KerML | High | 2-3 weeks |
| Phase 3: SysML | High | 2-3 weeks |
| Phase 4: Validation | Medium | 1-2 weeks |
| Phase 5: Integration | Medium | 1 week |
| **Total** | | **7-10 weeks** |

## Decision Point

Before implementing, consider:

1. **Is full parsing needed?** - For benchmarking LLM output, regex may be sufficient
2. **Maintenance burden** - Grammar must track SysML v2 spec changes
3. **Community contribution** - Could this become a standalone MIT-licensed SysML v2 parser?

## Notes

- The official SysML v2 grammar is complex (~250+ AST types)
- Start with a subset covering the most common constructs
- Prioritize constructs used in benchmark tasks
- Consider incremental adoption - use Langium for validation, keep regex for extraction initially
