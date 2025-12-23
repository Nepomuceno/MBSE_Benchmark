# SysML v2 State Machine Tasks Implementation

You are implementing the State Machine benchmark tasks (STM-001 to STM-003) for
the MBSE Benchmark project. This is a self-contained prompt with all context.

## Project Overview

**Repository**: MBSE Benchmark - A framework for evaluating AI models on
Model-Based Systems Engineering tasks, focusing on SysML v2.

**Your Task**: Implement 3 state machine tasks that test an AI's ability to
understand, analyze, and work with state machines in SysML v2.

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
    ├── 07-states.md          # Detailed task specifications
    └── local/                # Your working notes (not committed)
```

## Tasks to Implement

Create these 3 state machine tasks in `data/tasks/`:

### STM-001: sysml-state-extraction-001

- **Goal**: Extract and document state machine from SysML v2
- **Source**: StopWatchStates.sysml
- **Prompt**: Analyze this state machine and produce:
  1. List of all states
  2. Transition table (from-state, trigger, to-state)
  3. ASCII state diagram
  4. Identify unreachable states or ambiguities
- **Expected States**: ready, running, paused, stopped
- **Expected Signals**: VehicleStartSignal, VehicleOnSignal, VehicleOffSignal
- **Difficulty**: Medium, Weight: 2.0

### STM-002: sysml-state-complex-001

- **Goal**: Analyze nested/parallel states and actions
- **Source**: VehicleModel.sysml (vehicleStates section)
- **Prompt**: Analyze this state machine including:
  1. Parallel regions (operatingStates, healthStates)
  2. Entry and exit actions for each state
  3. Guard conditions on transitions
  4. Do activities within states
- **Expected Analysis**:
  - operatingStates: off → starting → on
  - healthStates: normal ↔ maintenance ↔ degraded
  - Entry: performSelfTest (on state)
  - Exit: applyParkingBrake (on state)
  - Do: providePower, senseTemperature
- **Difficulty**: Hard, Weight: 2.5

### STM-003: sysml-state-compare-001

- **Goal**: Compare two state machines for behavioral equivalence
- **Source**: Create two versions of a state machine with differences
- **Prompt**: Compare these two state machines:
  1. List states in one but not the other
  2. Identify transition differences
  3. Determine behavioral equivalence
  4. If not equivalent, describe a scenario where they differ
- **Difficulty**: Hard, Weight: 3.0

## Task Directory Structure

```text
data/tasks/sysml-state-{name}-001/
├── task.json
└── files/
    ├── states.sysml           # Primary state machine
    ├── states-alt.sysml       # Alternative version (STM-003 only)
    └── README.md              # Expected states and transitions
```

## task.json Template

```json
{
  "id": "sysml-state-{name}-001",
  "type": "analysis",
  "name": "Human-Readable Task Name",
  "description": "What this state machine task tests",
  "prompt": "Analyze this SysML v2 state machine...\n\nProvide:\n1. ...\n2. ...",
  "maxTokens": 2000,
  "files": {
    "initial": "files",
    "expected": []
  },
  "evaluation": {
    "type": "combined",
    "strategies": [
      {"type": "element-extraction", "weight": 0.4, "expectedElements": ["ready", "running", "paused", "stopped"]},
      {"type": "llm-judge", "weight": 0.6, "criteria": ["state_completeness", "transition_accuracy", "diagram_quality"]}
    ]
  }
}
```

## Expected Output Formats

### STM-001: State Extraction

```text
## States
- ready (initial)
- running
- paused
- stopped (final)

## Transition Table
| From    | Trigger             | To      |
|---------|---------------------|---------|
| ready   | VehicleStartSignal  | running |
| running | VehicleOnSignal     | paused  |
| paused  | VehicleOnSignal     | running |
| paused  | VehicleOffSignal    | stopped |

## ASCII State Diagram
    ┌─────────┐
    │  ready  │
    └────┬────┘
         │ VehicleStartSignal
         ▼
    ┌─────────┐
    │ running │◄───┐
    └────┬────┘    │
         │         │ VehicleOnSignal
         │ VehicleOnSignal
         ▼         │
    ┌─────────┐    │
    │ paused  ├────┘
    └────┬────┘
         │ VehicleOffSignal
         ▼
    ┌─────────┐
    │ stopped │
    └─────────┘

## Notes
- No unreachable states detected
- paused has two outgoing transitions (to running and stopped)
```

### STM-002: Complex State Analysis

```text
## Parallel Regions
1. operatingStates
   - States: off, starting, on
   - Transitions: off→starting (VehicleStartSignal), starting→on (after 1s)
   
2. healthStates
   - States: normal, maintenance, degraded
   - Transitions: normal→degraded (faultDetected)

## Entry Actions
| State    | Entry Action      |
|----------|-------------------|
| on       | performSelfTest() |
| starting | initializeSystems()|

## Exit Actions
| State | Exit Action        |
|-------|-------------------|
| on    | applyParkingBrake()|

## Do Activities
| State | Activity           |
|-------|-------------------|
| on    | providePower()     |
| on    | senseTemperature() |

## Guard Conditions
- starting→on: if (selfTestPassed)
```

### STM-003: Comparison

```text
## State Comparison
| State     | Machine A | Machine B |
|-----------|-----------|-----------|
| ready     | ✓         | ✓         |
| running   | ✓         | ✓         |
| paused    | ✓         | ✗         |
| waiting   | ✗         | ✓         |
| stopped   | ✓         | ✓         |

## Transition Differences
- Machine A: running→paused on VehicleOnSignal
- Machine B: running→waiting on VehicleOnSignal (different target)
- Machine B: waiting→running on VehicleOnSignal (additional)

## Behavioral Equivalence: NOT EQUIVALENT

## Differing Scenario
Input sequence: [VehicleStartSignal, VehicleOnSignal, VehicleOnSignal]
- Machine A: ready → running → paused → running
- Machine B: ready → running → waiting → running

The intermediate state differs (paused vs waiting), which may have
different associated actions or allowed transitions.
```

## Input File Preparation

### StopWatchStates.sysml

Already in `data/tasks/models/source/`. Contains:

- States: ready, running, paused, stopped
- Signals: VehicleStartSignal, VehicleOnSignal, VehicleOffSignal
- Transitions between states

### VehicleModel.sysml (States Section)

Extract the vehicleStates portion (~50-100 lines) showing:

- Parallel state structure (operatingStates, healthStates)
- Entry/exit/do actions
- Guard conditions

### Alternative State Machine (STM-003)

Create a modified version with meaningful differences:

```sysml
// states-alt.sysml - Modified version for comparison
state def StopWatchStatesAlt {
    // Rename 'paused' to 'waiting'
    state waiting;
    // Add different transition
    transition ready_to_running
        first ready
        accept VehicleStartSignal
        then running;
    // ... rest similar but with waiting instead of paused
}
```

## Source Models Location

Models are in `data/tasks/models/source/`:

- `StopWatchStates.sysml` - Simple state machine example
- `VehicleModel.sysml` - Complex states with parallel regions

## Evaluation Criteria

### STM-001 (Extraction)

- **state_completeness**: All states identified
- **transition_accuracy**: All transitions correct
- **diagram_quality**: Clear ASCII visualization
- **ambiguity_detection**: Identifies potential issues

### STM-002 (Complex)

- **parallel_understanding**: Identifies concurrent regions
- **action_identification**: Entry/exit/do actions found
- **guard_recognition**: Guard conditions identified

### STM-003 (Comparison)

- **comparison_thoroughness**: All differences found
- **equivalence_analysis**: Correct determination
- **scenario_quality**: Valid differing scenario

## Guidelines

1. **Use element-extraction** - For known state/transition names
2. **Include ASCII diagrams** - Test visualization ability
3. **Create meaningful alternatives** - For comparison task
4. **Weight appropriately** - 2.0-3.0 for state tasks
5. **Consider edge cases** - Self-transitions, unreachable states

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
- [x] STM-001: sysml-state-extraction-001 (YYYY-MM-DD)
```

## Local Notes

Use `.plan/local/` for your working notes - this folder is not committed to git.
