# SysML v2 Advanced Semantic Analysis Tasks Implementation

You are implementing the Advanced Semantic Analysis benchmark tasks (ADV-001 to
ADV-003) for the MBSE Benchmark project. This is a self-contained prompt.

## Project Overview

**Repository**: MBSE Benchmark - A framework for evaluating AI models on
Model-Based Systems Engineering tasks, focusing on SysML v2.

**Your Task**: Implement 3 advanced tasks that test deep understanding of
SysML v2 semantics, patterns, and best practices. These are the most complex
tasks in the benchmark.

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
    ├── 08-advanced.md        # Detailed task specifications
    └── local/                # Your working notes (not committed)
```

## Tasks to Implement

Create these 3 advanced tasks in `data/tasks/`:

### ADV-001: sysml-advanced-quality-001

- **Goal**: Assess model quality against best practices
- **Source**: family.sysml or VehicleModel.sysml subset
- **Prompt**: Perform quality assessment scoring 1-5 on:
  1. **Naming conventions** - Clear and consistent?
  2. **Documentation** - Elements properly documented?
  3. **Modularity** - Well-structured packages?
  4. **Completeness** - Dangling references? Missing elements?
  5. **Complexity** - Unnecessarily complex?
- **Expected Output**: Score + justification + recommendations for each
- **Difficulty**: Hard, Weight: 3.0

### ADV-002: sysml-advanced-patterns-001

- **Goal**: Identify SysML v2 modeling patterns
- **Source**: VehicleModel.sysml
- **Prompt**: Identify these modeling patterns:
  1. **Definition-Usage** - Where are defs vs usages?
  2. **Layered architecture** - Logical vs physical separation?
  3. **Interface segregation** - How are interfaces organized?
  4. **Variation points** - Where is variability modeled?
  5. **Requirements allocation** - How are requirements linked?
- **Expected**: Pattern identification with examples and benefits
- **Difficulty**: Hard, Weight: 3.0

### ADV-003: sysml-advanced-merge-001

- **Goal**: Merge two partial models into coherent whole
- **Source**: Create two complementary partial models
- **Prompt**: Given structural and behavioral partial models:
  1. Resolve naming conflicts
  2. Connect behavioral elements to structural elements
  3. Ensure all cross-references are valid
  4. Document assumptions made
- **Output**: Valid merged SysML v2 model
- **Difficulty**: Expert, Weight: 3.5

## Task Directory Structure

```text
data/tasks/sysml-advanced-{name}-001/
├── task.json
└── files/
    ├── model.sysml              # Primary model (ADV-001, ADV-002)
    ├── model-structural.sysml   # Structural partial (ADV-003)
    ├── model-behavioral.sysml   # Behavioral partial (ADV-003)
    └── README.md                # Expected analysis notes
```

## task.json Template

```json
{
  "id": "sysml-advanced-{name}-001",
  "type": "analysis",
  "name": "Human-Readable Task Name",
  "description": "What this advanced task tests",
  "prompt": "Perform [analysis type] on this model...\n\nProvide:\n1. ...",
  "maxTokens": 3000,
  "files": {
    "initial": "files",
    "expected": []
  },
  "evaluation": {
    "type": "llm-judge",
    "criteria": ["assessment_thoroughness", "scoring_justification", "recommendations_quality"],
    "weight": 3.0
  }
}
```

## Expected Output Formats

### ADV-001: Quality Assessment

```json
{
  "naming": {
    "score": 4,
    "justification": "Consistent PascalCase for definitions, camelCase for usages. Most names are descriptive.",
    "issues": ["Abbreviation 'fuelEcon' is unclear", "Some single-letter parameter names"],
    "recommendations": ["Expand abbreviations", "Use descriptive parameter names"]
  },
  "documentation": {
    "score": 2,
    "justification": "Only 30% of elements have doc strings. Package-level documentation missing.",
    "issues": ["No docs on port definitions", "Missing requirement rationale"],
    "recommendations": ["Add doc strings to all public definitions", "Document constraint rationale"]
  },
  "modularity": {
    "score": 3,
    "justification": "Logical package separation exists but some cross-cutting concerns.",
    "issues": ["Port definitions mixed with part definitions"],
    "recommendations": ["Extract ports to separate package", "Consider layer separation"]
  },
  "completeness": {
    "score": 4,
    "justification": "Most references resolve. No obvious missing elements.",
    "issues": ["One reference to undefined 'SensorCalibration'"],
    "recommendations": ["Add missing definition or remove reference"]
  },
  "complexity": {
    "score": 3,
    "justification": "Reasonable nesting depth. Some overly complex constraint expressions.",
    "issues": ["Constraint 'massCalculation' has 5 nested operations"],
    "recommendations": ["Break complex constraints into named sub-constraints"]
  },
  "overall_score": 3.2,
  "summary": "The model is functional but would benefit from documentation improvements and some structural refactoring.",
  "priority_recommendations": [
    "Add documentation to all public definitions",
    "Extract port definitions to separate package",
    "Simplify complex constraint expressions"
  ]
}
```

### ADV-002: Pattern Analysis

```markdown
## Patterns Identified

### 1. Definition-Usage Pattern ✓
**Evidence:**
- 15 part definitions in VehicleDefinitions package
- 23 part usages in VehicleConfiguration package
- Example: `part def Engine` defined once, used as `engine : Engine` in Vehicle

**Benefits:**
- Single source of truth for component specifications
- Enables reuse across configurations
- Changes propagate automatically

### 2. Layered Architecture ✓
**Evidence:**
- Logical layer: VehicleLogical package (functional decomposition)
- Physical layer: VehiclePhysical package (component allocation)
- Connection: `allocate` relationships link logical to physical

**Benefits:**
- Separation of concerns
- Independent evolution of layers
- Clear traceability

### 3. Interface Segregation ✓
**Evidence:**
- Small, focused port definitions (FuelPort, PowerPort)
- Interface defs group related ports
- No "god interfaces" with everything

**Benefits:**
- Loose coupling between components
- Easier testing and substitution

### 4. Variation Points ✗
**Evidence:**
- No explicit variation or variant keywords found
- Specialization used but not for variants

**Recommendation:**
- Consider adding variation for engine types (Gasoline, Diesel, Electric)

### 5. Requirements Allocation ✓
**Evidence:**
- 5 requirement definitions with satisfy relationships
- Requirements linked to specific components
- Constraints defined on requirements

**Benefits:**
- Traceability from requirements to design
- Verification planning support
```

### ADV-003: Model Merge

```sysml
// Merged model combining structural and behavioral elements
package MergedSystem {
    import StructuralDefinitions::*;
    import BehavioralDefinitions::*;

    // Structural elements (from model-structural.sysml)
    part def Controller {
        port sensorIn : SensorPort;
        port actuatorOut : ActuatorPort;
        
        // Connected behavioral element
        perform controlAction : ControlLoop;
    }
    
    part def Sensor {
        port dataOut : ~SensorPort;
        
        // Connected behavioral element  
        perform sensing : ReadSensor;
    }
    
    // Behavioral elements (from model-behavioral.sysml)
    action def ControlLoop {
        action readSensor : ReadSensor;
        action processData : ProcessData;
        action sendCommand : SendCommand;
        
        flow readSensor.output to processData.input;
        flow processData.output to sendCommand.input;
    }
    
    // Resolved conflict: renamed ProcessData parameter
    action def ProcessData {
        in sensorData : SensorReading;  // was 'input'
        out command : ControlCommand;    // was 'output'
    }
    
    // Integration: connect structure to behavior
    part system : System {
        part controller : Controller;
        part sensor : Sensor;
        
        connect sensor.dataOut to controller.sensorIn;
    }
}

/* Merge Assumptions:
 * 1. SensorPort type is compatible with ReadSensor output type
 * 2. ControlLoop executes continuously while Controller is active
 * 3. Renamed generic 'input'/'output' to specific names for clarity
 * 4. Added 'perform' relationships to link behavior to structure
 */
```

## Input File Preparation

### ADV-001: Quality Assessment Model

Prepare a model that has some quality issues to find:

- Mix of good and poor naming
- Some missing documentation
- At least one dangling reference
- Some complex expressions

### ADV-002: Pattern-Rich Model

Use VehicleModel.sysml sections showing:

- Multiple definitions and usages
- Package structure (if present)
- Specialization hierarchies
- Interface definitions
- Requirement relationships

### ADV-003: Partial Models to Merge

Create two complementary files:

**model-structural.sysml:**

```sysml
package StructuralDefinitions {
    part def Controller {
        port sensorIn : SensorPort;
        port actuatorOut : ActuatorPort;
    }
    
    part def Sensor {
        port dataOut : ~SensorPort;
    }
    
    part def Actuator {
        port commandIn : ~ActuatorPort;
    }
    
    port def SensorPort {
        out item reading : Real;
    }
    
    port def ActuatorPort {
        in item command : Real;
    }
}
```

**model-behavioral.sysml:**

```sysml
package BehavioralDefinitions {
    action def ReadSensor {
        out output : Real;
    }
    
    action def ProcessData {
        in input : Real;
        out output : Real;
    }
    
    action def SendCommand {
        in input : Real;
    }
    
    action def ControlLoop {
        action read : ReadSensor;
        action process : ProcessData;
        action send : SendCommand;
        
        flow read.output to process.input;
        flow process.output to send.input;
    }
}
```

## Source Models Location

Models are in `data/tasks/models/source/`:

- `VehicleModel.sysml` - Comprehensive example with many patterns
- `family.sysml` - Smaller model for quality assessment

## Evaluation Strategies

### ADV-001, ADV-002 (Analysis)

```json
{
  "evaluation": {
    "type": "llm-judge",
    "criteria": [
      "assessment_thoroughness",
      "scoring_justification", 
      "pattern_identification",
      "recommendations_quality"
    ],
    "weight": 3.0
  }
}
```

### ADV-003 (Merge)

```json
{
  "evaluation": {
    "type": "combined",
    "strategies": [
      {"type": "sysml-validation", "weight": 0.3},
      {"type": "llm-judge", "weight": 0.7, "criteria": [
        "merge_completeness",
        "conflict_resolution",
        "integration_quality",
        "assumptions_documented"
      ]}
    ]
  }
}
```

## Guidelines

1. **These are expert-level** - Weight 3.0+
2. **Prepare rich inputs** - Models need enough content for analysis
3. **Accept alternative approaches** - Multiple valid interpretations
4. **Focus on reasoning** - Justification matters as much as answers
5. **Document assumptions** - Especially for merge task

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
- [x] ADV-001: sysml-advanced-quality-001 (YYYY-MM-DD)
```

## Local Notes

Use `.plan/local/` for your working notes - this folder is not committed to git.
