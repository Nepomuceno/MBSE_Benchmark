package VehicleStates {
    // Vehicle state machine with parallel regions
    state def VehicleStateMachine {
        
        // Entry point
        entry;
            then off;
        
        // Define signals
        action def VehicleStartSignal;
        action def SelfTestPassedSignal;
        action def FaultDetectedSignal;
        action def MaintenanceRequiredSignal;
        action def RepairCompletedSignal;
        
        // Define actions
        action def performSelfTest;
        action def initializeSystems;
        action def applyParkingBrake;
        action def providePower;
        action def senseTemperature;
        action def runDiagnostics;
        
        // Parallel composite state for vehicle operations
        state vehicleStates parallel {
            
            // Operating states region
            state operatingStates {
                
                // Off state (initial)
                state off;
                
                // Starting state with entry action
                state starting {
                    entry action initializeSystems;
                }
                
                transition off_to_starting
                    first off
                    accept VehicleStartSignal
                    then starting;
                
                // On state with entry, exit, and do actions
                state on {
                    entry action performSelfTest;
                    exit action applyParkingBrake;
                    
                    do action providePower;
                    do action senseTemperature;
                }
                
                transition starting_to_on
                    first starting
                    accept SelfTestPassedSignal
                    if (selfTestPassed)
                    then on;
            }
            
            // Health states region (runs in parallel)
            state healthStates {
                
                // Normal state (initial)
                state normal {
                    do action runDiagnostics;
                }
                
                // Degraded state
                state degraded;
                
                transition normal_to_degraded
                    first normal
                    accept FaultDetectedSignal
                    then degraded;
                
                // Maintenance state
                state maintenance {
                    entry action runDiagnostics;
                }
                
                transition degraded_to_maintenance
                    first degraded
                    accept MaintenanceRequiredSignal
                    then maintenance;
                
                transition maintenance_to_normal
                    first maintenance
                    accept RepairCompletedSignal
                    then normal;
                
                // Also allow direct transition from normal to maintenance
                transition normal_to_maintenance
                    first normal
                    accept MaintenanceRequiredSignal
                    then maintenance;
            }
        }
    }
}
