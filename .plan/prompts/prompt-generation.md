# SysML v2 Generation Tasks Implementation

You are implementing the Generation benchmark tasks (GEN-001 to GEN-014) for the
MBSE Benchmark project. This is a self-contained prompt with all context needed.

## Project Overview

**Repository**: MBSE Benchmark - A framework for evaluating AI models on
Model-Based Systems Engineering tasks, focusing on SysML v2.

**Your Task**: Implement 14 generation tasks that test an AI's ability to
generate valid SysML v2 models from natural language requirements.

## Project Structure

```text
├── src/
│   └── evaluation/
│       └── validators/       # SysML validators (already implemented)
│           ├── sysml-syntax.ts      # Syntax validation
│           └── sysml-extractor.ts   # Component extraction
├── data/
│   └── tasks/
│       └── sysml-*/          # Individual task definitions
└── .plan/
    ├── 04-generation.md      # Detailed task specifications
    └── local/                # Your working notes (not committed)
```

## Tasks to Implement

Create these 14 generation tasks in `data/tasks/`:

### Easy Tasks (Weight: 1.0-1.5)

#### GEN-001: sysml-generate-part-001

- **Goal**: Generate simple part definition
- **Prompt**: Create SmartThermostat with attributes: currentTemperature,
  targetTemperature (ISQ::temperature), isHeating, isCooling (Boolean)
- **Expected**: Valid package with part def, imports, attributes

#### GEN-009: sysml-generate-constraints-001

- **Goal**: Generate constraint definitions for physics
- **Prompt**: Create Newton's Second Law (F=ma), Kinetic Energy (KE=0.5mv²),
  Power Equation (P=Fv) with ISQ types
- **Expected**: Constraint defs with proper attribute types and expressions

### Medium Tasks (Weight: 1.5-2.0)

#### GEN-002: sysml-generate-ports-001

- **Goal**: Generate ports and interfaces for sensor system
- **Prompt**: Create SensorPort (out: temperature, humidity), ControlPort
  (in: setpoint), and interface definition
- **Expected**: Port defs with items, interface def with ends

#### GEN-003: sysml-generate-requirements-001

- **Goal**: Generate requirements from natural language
- **Prompt**: Convert: battery 80% after 500 cycles, response <100ms,
  temp range -20°C to 50°C
- **Expected**: Requirement defs with doc strings and constraints

#### GEN-005: sysml-generate-actions-001

- **Goal**: Generate action definitions for coffee machine
- **Prompt**: Create GrindBeans (in: beans, out: ground), BrewCoffee
  (in: ground+water, out: coffee), MakeCoffee composite
- **Expected**: Action defs with parameters and flow connections

#### GEN-008: sysml-generate-usecase-001

- **Goal**: Generate use case definitions for home security
- **Prompt**: Create Arm System, Detect Intrusion, Notify Authorities
  with actors, subjects, objectives
- **Expected**: Use case defs with proper structure

#### GEN-010: sysml-generate-calc-001

- **Goal**: Generate calculation definitions for fuel economy
- **Prompt**: Create FuelConsumption, TotalMass, Range calculations
  with proper in parameters and return
- **Expected**: Calc defs with correct structure

#### GEN-013: sysml-generate-individual-001

- **Goal**: Generate individual definitions for fleet management
- **Prompt**: Create Vehicle_Type_A def, Vehicle_001/002 individuals
  with specific attribute values (VIN, date)
- **Expected**: Individual def and individual part syntax

#### GEN-014: sysml-generate-messages-001

- **Goal**: Generate signal and message definitions
- **Prompt**: Create StartCommand, StopCommand, StatusReport signals
  with payload attributes and message flow
- **Expected**: Signal defs, ports, message statements

### Hard Tasks (Weight: 2.0-3.0)

#### GEN-004: sysml-generate-states-001

- **Goal**: Generate state machine for traffic light
- **Prompt**: States: Red, Yellow, Green with timed transitions +
  Emergency state accessible from any state
- **Expected**: State def with states, transitions, time events

#### GEN-006: sysml-generate-subsystem-001

- **Goal**: Generate complete GPS Navigation Subsystem
- **Prompt**: GPSReceiver, MapDisplay, RouteCalculator parts + ports +
  connections + 2 requirements
- **Expected**: Complete package with all elements

#### GEN-007: sysml-generate-variation-001

- **Goal**: Generate model with specialization and variations
- **Prompt**: ElectricVehicle → Sedan, SUV, Truck specializations +
  StandardBattery, ExtendedRangeBattery variations
- **Expected**: Proper use of :> and variation/variant syntax

#### GEN-011: sysml-generate-connections-001

- **Goal**: Generate complete connection topology
- **Prompt**: Given Controller, Sensor, Actuator defs, create part usages,
  connect statements, and interface definition
- **Expected**: Valid connections with type compatibility

#### GEN-012: sysml-generate-analysis-001

- **Goal**: Generate analysis case for thermal analysis
- **Prompt**: Thermal analysis of electronics enclosure with subject,
  objective, parameters, action steps, return
- **Expected**: Complete analysis def following VehicleModel pattern

## Task Directory Structure

For generation tasks, no input files are typically needed:

```text
data/tasks/sysml-generate-{name}-001/
├── task.json          # Task definition with detailed prompt
└── files/
    └── README.md      # Optional: expected output pattern examples
```

## task.json Template

```json
{
  "id": "sysml-generate-{name}-001",
  "type": "generation",
  "name": "Human-Readable Task Name",
  "description": "What this task tests",
  "prompt": "Create a SysML v2 [structure]...\n\nRequirements:\n1. ...\n2. ...\n\nReturn only the SysML v2 code.",
  "maxTokens": 2000,
  "files": {
    "initial": "files",
    "expected": []
  },
  "evaluation": {
    "type": "combined",
    "strategies": [
      {"type": "sysml-validation", "weight": 0.4},
      {"type": "llm-judge", "weight": 0.6, "criteria": ["syntax_validity", "semantic_correctness", "requirements_coverage"]}
    ]
  }
}
```

## Evaluation Strategies

### For Simple Generation (syntax-checkable)

```json
{
  "evaluation": {
    "type": "sysml-validation",
    "weight": 1.0,
    "requiredElements": ["partDef:SmartThermostat", "attribute:currentTemperature"]
  }
}
```

### For Complex Generation (needs semantic evaluation)

```json
{
  "evaluation": {
    "type": "combined",
    "strategies": [
      {"type": "sysml-validation", "weight": 0.4},
      {"type": "llm-judge", "weight": 0.6, "criteria": ["completeness", "correctness", "style"]}
    ]
  }
}
```

## Prompt Writing Guidelines

**DO:**

- Specify exact output format (package name, required imports)
- List all required elements explicitly
- Include example output patterns when helpful
- State whether ISQ imports are expected
- End with "Return only the SysML v2 code, no explanation"

**DON'T:**

- Leave ambiguity about expected structure
- Assume knowledge not provided
- Use vague terms without definition

**Good Prompt Example:**

```text
Create a SysML v2 part definition for a 'SmartThermostat' with:

Requirements:
1. Package named 'SmartThermostat'
2. Import ISQ::* and ScalarValues::*
3. Part def 'SmartThermostat' with:
   - attribute currentTemperature : ISQ::TemperatureValue
   - attribute targetTemperature : ISQ::TemperatureValue
   - attribute isHeating : Boolean
   - attribute isCooling : Boolean

Return only the SysML v2 code, no explanation.
```

## Guidelines

1. **No input files needed** - Generation is from scratch
2. **Use combined evaluation** - sysml-validation + llm-judge
3. **Be very specific** - Exact output format in prompts
4. **Weight by difficulty** - 1.0 (easy) to 3.0 (expert)
5. **Test with validator** - Run sysml-syntax validator on expected patterns

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
- [x] GEN-001: sysml-generate-part-001 (YYYY-MM-DD)
```

## Local Notes

Use `.plan/local/` for your working notes - this folder is not committed to git.
