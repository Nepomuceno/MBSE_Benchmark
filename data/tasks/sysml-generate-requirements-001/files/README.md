# GEN-003: Requirement Generation

## Expected Output Pattern

```sysml
package SystemRequirements {
    import ISQ::*;
    import ScalarValues::*;

    requirement def BatteryCapacityReq {
        doc /* The battery shall have minimum 80% capacity after 500 charge cycles */
        
        attribute capacity : Real;
        attribute cycles : Integer;
        
        require constraint {
            capacity >= 0.8 and cycles >= 500
        }
    }

    requirement def ResponseTimeReq {
        doc /* The system shall respond to user input within 100 milliseconds */
        
        attribute responseTime : ISQ::TimeValue;
        
        require constraint {
            responseTime <= 100[ms]
        }
    }

    requirement def OperatingTempReq {
        doc /* Operating temperature range shall be -20°C to 50°C */
        
        attribute temperature : ISQ::TemperatureValue;
        
        require constraint {
            temperature >= -20[°C] and temperature <= 50[°C]
        }
    }
}
```

## Notes

- Tests conversion from natural language to formal requirements
- Must include doc strings
- Constraint expressions should capture requirement logic
