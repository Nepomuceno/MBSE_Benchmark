# GEN-001: Simple Part Definition Generation

## Expected Output Pattern

```sysml
package SmartThermostat {
    import ISQ::*;
    import ScalarValues::*;

    part def SmartThermostat {
        attribute currentTemperature : ISQ::TemperatureValue;
        attribute targetTemperature : ISQ::TemperatureValue;
        attribute isHeating : Boolean;
        attribute isCooling : Boolean;
    }
}
```

## Notes

- This is a basic generation task testing ability to create simple part definitions
- Must include proper package structure and imports
- Attributes should use appropriate ISQ types for temperature
- Boolean types for heating/cooling status
