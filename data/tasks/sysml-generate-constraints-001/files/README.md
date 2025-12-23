# GEN-009: Constraint Definition Generation

## Expected Output Pattern

```sysml
package PhysicsConstraints {
    import ISQ::*;
    import ScalarValues::*;

    constraint def NewtonsSecondLaw {
        attribute F : ISQ::ForceValue;
        attribute m : ISQ::MassValue;
        attribute a : ISQ::AccelerationValue;
        
        F == m * a
    }

    constraint def KineticEnergy {
        attribute KE : ISQ::EnergyValue;
        attribute m : ISQ::MassValue;
        attribute v : ISQ::SpeedValue;
        
        KE == 0.5 * m * v ** 2
    }

    constraint def PowerEquation {
        attribute P : ISQ::PowerValue;
        attribute F : ISQ::ForceValue;
        attribute v : ISQ::SpeedValue;
        
        P == F * v
    }
}
```

## Notes

- Tests ability to create constraint definitions with mathematical expressions
- Must use proper ISQ types for physical quantities
- Expressions should follow SysML v2 syntax
