package HVACSystemRequirements {

    import eVehicleLibrary::*;

    requirement def TemperatureRegulationReqDef {
        doc /* The HVAC system shall regulate the cabin temperature based on user settings. */

        attribute setTemperature : Real;
        attribute actualTemperature : Real;

        require constraint { abs(actualTemperature - setTemperature) <= 1 }
    }

    requirement def CoolingFunctionReqDef {
        doc /* The HVAC system shall reduce the cabin temperature to the set value when cooling is required. */

        attribute setCoolingTemperature : Real;
        attribute actualCoolingTemperature : Real;

        require constraint { actualCoolingTemperature <= setCoolingTemperature }
    }

    requirement def HeatingFunctionReqDef {
        doc /* The HVAC system shall increase the cabin temperature to the set value when heating is required. */

        attribute setHeatingTemperature : Real;
        attribute actualHeatingTemperature : Real;

        require constraint { actualHeatingTemperature >= setHeatingTemperature }
    }

    requirement def DefrostingReqDef {
        doc /* The HVAC system shall defrost the windshield and windows when activated. */

        attribute defrostTime : Real;
        attribute maxDefrostTime : Real;

        require constraint { defrostTime <= maxDefrostTime }
    }

    requirement def AirQualityControlReqDef {
        doc /* The HVAC system shall filter and maintain cabin air quality by removing pollutants and controlling humidity. */

        attribute particleFiltrationEfficiency : Real;
        attribute humidityLevel : Real;
        attribute minFiltrationEfficiency : Real;
        attribute minHumidity : Real;
        attribute maxHumidity : Real;

        require constraint { 
            particleFiltrationEfficiency >= minFiltrationEfficiency &&
            humidityLevel >= minHumidity &&
            humidityLevel <= maxHumidity
        }
    }

    requirement def PerformanceReqDef {
        doc /* The HVAC system shall respond to user inputs within 1 second. */

        attribute responseTime : Real;
        attribute maxResponseTime : Real;

        require constraint { responseTime <= maxResponseTime }
    }
}

package HVACComponentModel {

    // Component Definitions
    part def TemperatureController {
        attribute currentTemp : Real = 22.0; // Celsius
        attribute targetTemp : Real = 21.0; // Celsius
    }

    part def Compressor {
        attribute coolingCapacity : Real = 5000.0; // Watts
        attribute outputTemp : Real = 18.0; // Celsius
    }

    part def Heater {
        attribute heatingCapacity : Real = 3000.0; // Watts
    }

    part def AirFilter {
        attribute filtrationEfficiency : Real = 92.0; // Percent
    }

    part def ControlPanel {
        attribute responseTime : Real = 0.5; // seconds
    }

    // HVAC System
    part def HVACSystem {
        part tempController : TemperatureController;
        part compressor : Compressor;
        part heater : Heater;
        part airFilter : AirFilter;
        part controlPanel : ControlPanel;
    }

    // HVAC System Instance with Satisfaction Relationships
    part hvacSystem_instance : HVACSystem {
        
        // Satisfied Requirements
        satisfy tempRegReq : HVACSystemRequirements::TemperatureRegulationReqDef by hvacSystem_instance.tempController {
            // Temperature difference is within 1 degree: |22 - 21| = 1 <= 1
        }

        satisfy coolingReq : HVACSystemRequirements::CoolingFunctionReqDef by hvacSystem_instance.compressor {
            // Compressor output temp 18 <= target temp (varies)
        }

        // Note: The following requirements are NOT satisfied (no satisfy statements):
        // - HeatingFunctionReqDef (no heater satisfy relationship)
        // - DefrostingReqDef (no defrosting component)
        // - AirQualityControlReqDef (no satisfy relationship despite having air filter)
        // - PerformanceReqDef (no satisfy relationship despite having control panel)
    }
}
