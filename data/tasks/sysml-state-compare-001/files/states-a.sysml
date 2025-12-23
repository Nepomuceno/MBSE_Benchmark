package DroneStatesA {
    // Drone control state machine - Version A
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
        
        transition flying_to_hovering
            first flying
            accept LandSignal
            then hovering;
        
        transition flying_to_emergency
            first flying
            accept EmergencySignal
            then emergency;
        
        // Hovering state (paused in flight)
        state hovering;
        
        transition hovering_to_flying
            first hovering
            accept TakeoffSignal
            then flying;
        
        transition hovering_to_landed
            first hovering
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
        
        transition emergency_to_landed
            first emergency
            accept LandSignal
            then landed;
    }
}
