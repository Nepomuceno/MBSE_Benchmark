package ConstraintValidationExamples {

    // Example 1: Valid constraint
    requirement def TemperatureReq {
        doc /* Temperature shall be within range */
        
        attribute setTemperature : Temperature;
        attribute actualTemperature : Temperature;
        
        require constraint { abs(actualTemperature - setTemperature) <= 1 }
    }
    
    // Example 2: Invalid - incomplete expression
    requirement def CoolingReq {
        doc /* Cooling temperature constraint */
        
        attribute setCoolingTemp : Temperature;
        attribute actualCoolingTemp : Temperature;
        
        require constraint { actualCoolingTemp <= }  // Missing right operand
    }
    
    // Example 3: Valid constraint with multiple conditions
    requirement def AirQualityReq {
        doc /* Air quality constraints */
        
        attribute filtrationEfficiency : Percentage;
        attribute humidity : Percentage;
        attribute minEfficiency : Percentage;
        attribute minHumidity : Percentage;
        attribute maxHumidity : Percentage;
        
        require constraint {
            filtrationEfficiency >= minEfficiency &&
            humidity >= minHumidity &&
            humidity <= maxHumidity
        }
    }
    
    // Example 4: Invalid - dangling operator
    requirement def ResponseTimeReq {
        doc /* Response time constraint */
        
        attribute responseTime : Time;
        attribute maxResponseTime : Time;
        
        require constraint { responseTime <= maxResponseTime && }  // Dangling &&
    }
    
    // Example 5: Invalid - wrong operator (assignment vs comparison)
    requirement def InterfaceReq {
        doc /* Interface status constraint */
        
        attribute interfaceStatus : Boolean;
        
        require constraint { interfaceStatus = true }  // Should be == not =
    }
    
    // Example 6: Valid boolean constraint
    requirement def SafetyReq {
        doc /* Safety system active constraint */
        
        attribute safetySystemActive : Boolean;
        attribute emergencyMode : Boolean;
        
        require constraint { safetySystemActive == true || emergencyMode == false }
    }
    
    // Example 7: Invalid - missing closing brace
    requirement def PowerReq {
        doc /* Power consumption constraint */
        
        attribute powerConsumption : Power;
        attribute maxPower : Power;
        
        require constraint { powerConsumption <= maxPower
    }  // Missing closing brace for constraint
    
    // Example 8: Valid numeric comparison
    requirement def ReliabilityReq {
        doc /* Reliability constraint */
        
        attribute operationalYears : Integer;
        attribute minYears : Integer = 5;
        
        require constraint { operationalYears >= minYears }
    }
}
