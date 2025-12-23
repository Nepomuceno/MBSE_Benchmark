# GEN-007: Specialization and Variation Generation

## Expected Output Pattern

```sysml
package ElectricVehicles {
    import ISQ::*;

    part def ElectricVehicle {
        attribute batteryCapacity : ISQ::EnergyValue;
        attribute range : ISQ::LengthValue;
        attribute weight : ISQ::MassValue;
        
        variation batteryType {
            variant StandardBattery;
            variant ExtendedRangeBattery;
        }
    }

    part def Sedan :> ElectricVehicle {
        attribute passengers : Integer;
    }

    part def SUV :> ElectricVehicle {
        attribute cargoVolume : ISQ::VolumeValue;
    }

    part def Truck :> ElectricVehicle {
        attribute towingCapacity : ISQ::MassValue;
    }
}
```

## Notes

- Tests ability to use specialization (:>) syntax
- Variation defines alternative configurations
- Variants represent specific choices within a variation
- Specializations inherit base attributes and add specific ones
