/**
 * Invalid HVACSystemRequirements - Malformed Expressions
 * Based on: GfSE/SysML-v2-Models/models/SE_Models/HVACSystemRequirements.sysml
 * ERROR TYPE: SYNTAX - Malformed constraint expressions and structure
 */
package HVACSystemRequirements {

    import eVehicleLibrary::*;

    requirement def TemperatureRegulationReqDef {
        doc /* The HVAC system shall regulate the cabin temperature based on user settings. */

        attribute setTemperature Temperature;  // ERROR: missing colon
        attribute actualTemperature : ;  // ERROR: missing type

        require constraint { abs(actualTemperature - setTemperature) <= }  // ERROR: incomplete expression
    }

    requirement def CoolingFunctionReqDef {
        doc /* The HVAC system shall reduce the cabin temperature to the set value when cooling is required. */

        attribute setCoolingTemperature : Temperature;
        attribute : Temperature;  // ERROR: missing attribute name

        require constraint { actualCoolingTemperature <= setCoolingTemperature  // ERROR: missing closing brace
    }

    requirement def HeatingFunctionReqDef {
        doc /* The HVAC system shall increase the cabin temperature to the set value when heating is required. */

        attribute setHeatingTemperature : Temperature;
        attribute actualHeatingTemperature : Temperature;

        require constraint { actualHeatingTemperature >= }  // ERROR: missing right operand
    }

    requirement def DefrostingReqDef {
        doc /* The HVAC system shall defrost the windshield and windows when activated. */

        attribute defrostTime : Time;
        attribute maxDefrostTime : Time;

        require constraint { defrostTime <= maxDefrostTime && }  // ERROR: dangling operator
    }

    requirement def AirQualityControlReqDef {
        doc /* The HVAC system shall filter and maintain cabin air quality. */

        attribute particleFiltrationEfficiency : Percentage;
        attribute humidityLevel : Percentage[0..100];  // ERROR: invalid multiplicity for scalar
        attribute minFiltrationEfficiency : Percentage;
        attribute minHumidity maxHumidity : Percentage;  // ERROR: malformed declaration

        require constraint { 
            particleFiltrationEfficiency >= minFiltrationEfficiency &&
            humidityLevel >= minHumidity
            humidityLevel <= maxHumidity  // ERROR: missing && operator
        }
    }

    requirement def PerformanceReqDef {
        doc /* The HVAC system shall respond to user inputs within 1 second. 

        attribute responseTime : Time;  // ERROR: unclosed doc comment above
        attribute maxResponseTime : Time;

        require constraint { responseTime <= maxResponseTime }
    }

    requirement def ReliabilityReqDef {
        doc /* The HVAC system shall operate reliably. */

        attribute operationalYears : Integer;
        attribute operationalDistance : Distance;
        attribute minOperationalYears : Integer = ;  // ERROR: missing default value

        require constraint { 
            operationalYears >= minOperationalYears &&
            operationalDistance >= 100000  // Missing unit or proper constraint
        }
    }

    requirement def PowerConsumptionReqDef {
        doc /* The HVAC system shall minimize power consumption. */

        attribute powerConsumption : Power
        attribute maxPowerConsumption : Power;  // ERROR: missing semicolon on previous line

        require constraint { powerConsumption <= maxPowerConsumption }
    }

    requirement def NoiseLevelsReqDef  // ERROR: missing opening brace
        doc /* The HVAC system shall operate quietly. */

        attribute noiseLevel : Decibel;
        attribute maxNoiseLevel : Decibel;

        require constraint { noiseLevel <= maxNoiseLevel }
    }

    requirement def InterfaceReqDef {
        doc /* Interface requirement */

        attribute interfaceStatus : Boolean;

        require constraint { interfaceStatus = true }  // ERROR: should be == not =
    }
}
