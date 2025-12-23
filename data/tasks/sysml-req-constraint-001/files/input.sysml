package VehicleModel {

    // Requirements Definitions
    requirement def VehicleMassRequirement {
        doc /* The vehicle's actual mass shall not exceed the required maximum mass for optimal performance and safety. */
        
        attribute massActual : Real;
        attribute massRequired : Real = 2000.0; // kg
        
        require constraint { massActual <= massRequired }
    }
    
    requirement def VehicleFuelEconomyRequirement {
        doc /* The vehicle shall meet minimum fuel economy standards. */
        
        attribute fuelEconomy : Real;
        attribute minFuelEconomy : Real = 15.0; // km/L
        
        require constraint { fuelEconomy >= minFuelEconomy }
    }
    
    requirement def TorqueGenerationRequirement {
        doc /* The engine shall generate sufficient torque for vehicle operation. */
        
        attribute torqueGenerated : Real;
        attribute minTorque : Real = 300.0; // Nm
        
        require constraint { torqueGenerated >= minTorque }
    }
    
    // Part Definitions with Mass Attributes
    part def Body {
        attribute mass : Real = 75.0; // kg
    }
    
    part def Engine {
        attribute mass : Real = 800.0; // kg
        attribute torque : Real = 320.0; // Nm
    }
    
    part def Transmission {
        attribute mass : Real = 875.0; // kg
    }
    
    part def RearAxle {
        attribute mass : Real = 200.0; // kg
    }
    
    part def FuelTank {
        attribute mass : Real = 100.0; // kg (empty tank)
        attribute fuelMass : Real = 200.0; // kg (fuel weight)
    }
    
    part def FrontAxle {
        attribute mass : Real = 100.0; // kg
    }
    
    part def Driveshaft {
        attribute mass : Real = 60.0; // kg
    }
    
    // Vehicle Part Definition
    part def Vehicle {
        attribute calculatedMass : Real;
        attribute fuelEconomy : Real = 14.5; // km/L
        
        part body : Body;
        part engine : Engine;
        part transmission : Transmission;
        part rearAxle : RearAxle;
        part fuelTank : FuelTank;
        part frontAxle : FrontAxle;
        part driveshaft : Driveshaft;
    }
    
    // Vehicle Instance
    part vehicle_b : Vehicle {
        // Calculated mass would be: 75 + 800 + 875 + 200 + 100 + 200 + 100 + 60 = 2410 kg
        // (body + engine + transmission + rearAxle + fuelTank + fuelMass + frontAxle + driveshaft)
        
        // Requirement Satisfaction Relationships
        satisfy vehicleMassRequirement : VehicleMassRequirement by vehicle_b {
            // This requirement is NOT satisfied: actual mass ~2410kg > required 2000kg
        }
        
        satisfy vehicleFuelEconomyRequirement : VehicleFuelEconomyRequirement by vehicle_b {
            // This requirement is NOT satisfied: 14.5 km/L < 15.0 km/L
        }
        
        satisfy torqueGenerationRequirement : TorqueGenerationRequirement by vehicle_b.engine {
            // This requirement IS satisfied: engine generates 320 Nm >= 300 Nm required
        }
    }
}
