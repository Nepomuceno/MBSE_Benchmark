# Vehicle State Machine - Expected Analysis

## Parallel Regions

This state machine uses **parallel composition**, meaning two state regions execute concurrently.

### Region 1: operatingStates

Manages the operational state of the vehicle.

**States:**

- **off** (initial)
- **starting**
- **on**

**Transitions:**

- off → starting (on VehicleStartSignal)
- starting → on (on SelfTestPassedSignal, with guard condition)

### Region 2: healthStates

Monitors the health and maintenance status of the vehicle, running in parallel with operating states.

**States:**

- **normal** (initial)
- **degraded**
- **maintenance**

**Transitions:**

- normal → degraded (on FaultDetectedSignal)
- normal → maintenance (on MaintenanceRequiredSignal)
- degraded → maintenance (on MaintenanceRequiredSignal)
- maintenance → normal (on RepairCompletedSignal)

## Entry Actions

| State       | Entry Action      |
|-------------|-------------------|
| starting    | initializeSystems |
| on          | performSelfTest   |
| maintenance | runDiagnostics    |

## Exit Actions

| State | Exit Action       |
|-------|-------------------|
| on    | applyParkingBrake |

## Do Activities

Do activities execute continuously while the state is active.

| State  | Activity            |
|--------|---------------------|
| on     | providePower        |
| on     | senseTemperature    |
| normal | runDiagnostics      |

## Guard Conditions

| Transition    | Guard Condition     |
|---------------|---------------------|
| starting → on | if (selfTestPassed) |

## Key Concepts

### Parallel States

The `vehicleStates` is marked as `parallel`, meaning both `operatingStates` and `healthStates` regions execute simultaneously. The vehicle can be in one state from each region at the same time, for example:

- operating: **on**, health: **normal**
- operating: **starting**, health: **degraded**
- operating: **off**, health: **maintenance**

### Action Types

- **Entry actions**: Execute once when entering the state
- **Exit actions**: Execute once when leaving the state
- **Do activities**: Execute continuously while in the state
