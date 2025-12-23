# GEN-002: Port and Interface Generation

## Expected Output Pattern

```sysml
package SensorSystem {
    import ISQ::*;
    import ScalarValues::*;

    port def SensorPort {
        out temperature : ISQ::TemperatureValue;
        out humidity : Real;
    }

    port def ControlPort {
        in setpoint : ISQ::TemperatureValue;
    }

    interface def SensorControlInterface {
        end sensor : SensorPort;
        end controller : ControlPort;
    }
}
```

## Notes

- Tests ability to create port definitions with directional items
- Interface definition must connect two ends
- Proper use of in/out keywords for port items
