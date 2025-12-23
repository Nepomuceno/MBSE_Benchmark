# GEN-010: Calculation Definition Generation

## Expected Output Pattern

```sysml
package FuelEconomyCalculations {
    import ISQ::*;
    import ScalarValues::*;

    calc def FuelConsumption {
        in distance : ISQ::LengthValue;
        in fuelUsed : ISQ::VolumeValue;
        return consumptionRate : Real;
        
        consumptionRate = fuelUsed / distance
    }

    calc def TotalMass {
        in masses : ISQ::MassValue[0..*];
        return totalMass : ISQ::MassValue;
        
        totalMass = masses->sum()
    }

    calc def Range {
        in fuelCapacity : ISQ::VolumeValue;
        in consumptionRate : Real;
        return maxDistance : ISQ::LengthValue;
        
        maxDistance = fuelCapacity / consumptionRate
    }
}
```

## Notes

- Tests ability to create calculation definitions
- Must include proper in parameters and return types
- Return statement should provide computation logic
