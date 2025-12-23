package DroneStatesB {
    // Drone control state machine - Version B (Modified)
    state def DroneStateMachine {
        
        entry;
            then idle;
        
        // Define signals
        action def StartupSignal;
        action def TakeoffSignal;
        action def LandSignal;
        action def EmergencySignal;
        action def ResetSignal;
        
        // Idle state (initial)
        state idle;
        
        transition idle_to_ready
            first idle
            accept StartupSignal
            then ready;
        
        // Ready state
        state ready;
        
        transition ready_to_flying
            first ready
            accept TakeoffSignal
            then flying;
        
        // Flying state
        state flying;
        
        // DIFFERENCE: Instead of hovering, transition to waiting
        transition flying_to_waiting
            first flying
            accept LandSignal
            then waiting;
        
        transition flying_to_emergency
            first flying
            accept EmergencySignal
            then emergency;
        
        // DIFFERENCE: waiting state instead of hovering
        state waiting;
        
        transition waiting_to_flying
            first waiting
            accept TakeoffSignal
            then flying;
        
        transition waiting_to_landed
            first waiting
            accept LandSignal
            then landed;
        
        // Landed state
        state landed;
        
        transition landed_to_idle
            first landed
            accept ResetSignal
            then idle;
        
        // Emergency state
        state emergency;
        
        // DIFFERENCE: Emergency can transition directly to idle (with ResetSignal)
        transition emergency_to_idle
            first emergency
            accept ResetSignal
            then idle;
        
        // Also keep the emergency to landed transition
        transition emergency_to_landed
            first emergency
            accept LandSignal
            then landed;
    }
}
