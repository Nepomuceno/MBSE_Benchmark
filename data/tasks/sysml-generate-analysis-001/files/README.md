# GEN-012: Analysis Case Generation

## Expected Output Pattern

```sysml
package ThermalAnalysis {
    import ISQ::*;

    part def Enclosure {
        attribute maxTemperature : ISQ::TemperatureValue;
    }

    requirement def TemperatureRequirement {
        doc /* Internal temperature shall not exceed 85°C */
        attribute temperature : ISQ::TemperatureValue;
        require constraint { temperature <= 85[°C] }
    }

    analysis def ThermalAnalysisCase {
        subject enclosure : Enclosure;
        
        objective tempReq : TemperatureRequirement;
        
        in ambientTemperature : ISQ::TemperatureValue;
        in powerDissipation : ISQ::PowerValue;
        in airflowRate : ISQ::VolumeFlowRateValue;
        
        return internalTemperature : ISQ::TemperatureValue;
        
        action calculateHeatTransfer {
            in power = powerDissipation;
            in airflow = airflowRate;
        }
        
        action simulateTemperature {
            in ambient = ambientTemperature;
        }
        
        action verifyLimits {
            in calculated = internalTemperature;
            in requirement = tempReq;
        }
    }
}
```

## Notes

- Tests ability to create analysis case definitions
- Must include subject, objective, parameters, and actions
- Actions should represent analysis workflow
- Return value represents analysis output
