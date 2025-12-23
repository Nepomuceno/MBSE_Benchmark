# StopWatch State Machine - Expected Analysis

## Expected States

- **ready** (initial state)
- **running**
- **paused**
- **stopped** (final state)

## Expected Transitions

| From    | Trigger             | To      |
|---------|---------------------|---------|
| ready   | VehicleStartSignal  | running |
| running | VehicleOnSignal     | stopped |
| running | VehicleOffSignal    | paused  |
| paused  | VehicleOffSignal    | running |
| paused  | VehicleOffSignal    | stopped |
| stopped | VehicleOffSignal    | done    |

## Expected Signals/Actions

- **VehicleStartSignal** - Starts the stopwatch
- **VehicleOnSignal** - Signals vehicle is on
- **VehicleOffSignal** - Signals vehicle is off

## Key Observations

### Ambiguity/Non-determinism

The `paused` state has **two outgoing transitions** with the same trigger (`VehicleOffSignal`):

1. `paused → running` on VehicleOffSignal
2. `paused → stopped` on VehicleOffSignal

This creates non-deterministic behavior - when in the paused state and VehicleOffSignal is received, it's unclear which transition should be taken. This is a potential issue in the state machine design.

## Expected ASCII Diagram Structure

The diagram should show:

- Initial state (ready) at the top
- Flow from ready → running → paused → stopped
- The ambiguous transitions from paused state
- Clear indication of triggers on transitions
