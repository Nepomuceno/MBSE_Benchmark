# Category 7: State Machine Understanding Tasks

## Goal

Test AI's ability to understand, analyze, and generate state machines in SysML v2.

## Tasks

### Task STM-001: State Machine Extraction

- **ID**: `sysml-state-extraction-001`
- **Type**: `analysis`
- **Difficulty**: Medium
- **Description**: Extract and document a state machine from SysML v2
- **Source Model**: `StopWatchStates.sysml`
- **Prompt**: "Analyze this state machine and produce:
  1. A list of all states
  2. A transition table (from-state, trigger, to-state)
  3. An ASCII state diagram
  4. Identify any unreachable states or missing transitions"
- **Expected**:
  - States: ready, running, paused, stopped
  - Transitions with VehicleStartSignal, VehicleOnSignal, VehicleOffSignal triggers
  - Note: paused has two transitions on same signal (ambiguity)
- **Evaluation**:
  - Type: `element-extraction` + `llm-judge`
  - Criteria: `["state_completeness", "transition_accuracy", "diagram_quality"]`
  - Weight: 2.0

### Task STM-002: Complex State Analysis

- **ID**: `sysml-state-complex-001`
- **Type**: `analysis`
- **Difficulty**: Hard
- **Description**: Analyze nested/parallel states and entry/exit actions
- **Source Model**: `VehicleModel.sysml` (States section)
- **Prompt**: "Analyze the vehicleStates state machine including:
  1. Parallel regions (operatingStates, healthStates)
  2. Entry and exit actions for each state
  3. Guard conditions on transitions
  4. Do activities within states
  Create a comprehensive state machine description."
- **Expected**:
  - operatingStates: off, starting, on with transitions
  - healthStates: normal, maintenance, degraded
  - Entry actions (performSelfTest), exit actions (applyParkingBrake)
  - Do activities (providePower, senseTemperature)
- **Evaluation**:
  - Type: `llm-judge`
  - Criteria: `["parallel_understanding", "action_identification", "guard_recognition"]`
  - Weight: 2.5

### Task STM-003: State Machine Comparison

- **ID**: `sysml-state-compare-001`
- **Type**: `analysis`
- **Difficulty**: Hard
- **Description**: Compare two state machines for behavioral equivalence
- **Source Model**: `DroneModelLogical.sysml` (droneStates) + alternative version
- **Prompt**: "Compare these two state machines for the drone system:
  1. List states that appear in one but not the other
  2. Identify transitions that differ
  3. Determine if they are behaviorally equivalent
  4. If not equivalent, describe a scenario where they differ"
- **Expected**: Detailed comparison with equivalence analysis
- **Evaluation**:
  - Type: `llm-judge`
  - Criteria: `["comparison_thoroughness", "equivalence_analysis", "scenario_quality"]`
  - Weight: 3.0

## Implementation Notes

### State Machine Parsing

Extract from SysML v2:

- `state def` declarations
- `state` usages with nesting
- `transition` with first/accept/then
- `entry`, `exit`, `do` actions
- Guard conditions (`if`)
- Signal/event triggers

### Diagram Generation

For ASCII diagrams:

```text
[ready] --VehicleStartSignal--> [running]
   ^                               |
   |                     VehicleOnSignal
   |                               v
[stopped] <--VehicleOffSignal-- [paused]
```

### Behavioral Equivalence

Check:

- Same reachable states
- Same accepted event sequences
- Same final states for given inputs

### Edge Cases

Consider:

- Self-transitions
- Unreachable states
- Non-determinism (multiple transitions on same trigger)
- Missing transitions (implicit rejection)
