# GEN-013: Individual Definition Generation

## Expected Output Pattern

```sysml
package FleetManagement {
    part def Vehicle_Type_A {
        attribute vin : String;
        attribute registrationDate : String;
    }

    individual def Vehicle_001 :> Vehicle_Type_A {
        attribute redefines vin = "VIN123";
        attribute redefines registrationDate = "2024-01-15";
    }

    individual def Vehicle_002 :> Vehicle_Type_A {
        attribute redefines vin = "VIN456";
        attribute redefines registrationDate = "2024-02-20";
    }

    part Fleet {
        individual vehicle1 : Vehicle_001;
        individual vehicle2 : Vehicle_002;
    }
}
```

## Notes

- Tests ability to create individual definitions
- Individuals specialize from a base definition
- Individual parts are specific instances with bound values
- Must demonstrate attribute value binding
