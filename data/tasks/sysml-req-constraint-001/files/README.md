# Constraint Verification with Calculation Task

This task tests the AI's ability to verify constraints by performing calculations on model attributes.

## The Challenge

The vehicleMassRequirement constraint states: `massActual <= massRequired` where `massRequired = 2000.0 kg`

## Expected Calculation

Calculate actual vehicle mass from all components:

```text
body:           75 kg
engine:        800 kg
transmission:  875 kg
rearAxle:      200 kg
fuelTank:      100 kg (empty tank)
fuelMass:      200 kg (fuel weight)
frontAxle:     100 kg
driveshaft:     60 kg
------------------------
Total:        2410 kg
```

## Expected Result

**Constraint**: massActual <= 2000 kg

**Calculated Mass**: 2410 kg

**Result**: **FAILS** (2410 > 2000)

## Key Evaluation Points

- Correctly extracts all mass values from the model
- Performs accurate summation (2410 kg total)
- Compares against the constraint bound (2000 kg)
- Correctly concludes the constraint FAILS
- Shows clear step-by-step reasoning
