package BehavioralDefinitions {
    doc /* Behavioral definitions for a control system - actions and control logic */
    
    // Action definitions for control behavior
    action def ReadSensor {
        doc /* Action to read sensor data */
        out output : Real;
    }
    
    action def ProcessData {
        doc /* Action to process input data and compute output */
        in input : Real;
        out output : Real;
    }
    
    action def SendCommand {
        doc /* Action to send command to actuator */
        in input : Real;
    }
    
    action def ValidateInput {
        doc /* Action to validate sensor input is within bounds */
        in data : Real;
        out valid : Boolean;
    }
    
    // Control loop action
    action def ControlLoop {
        doc /* Main control loop that reads, processes, validates, and commands */
        
        // Sub-actions in sequence
        action read : ReadSensor;
        action validate : ValidateInput;
        action process : ProcessData;
        action send : SendCommand;
        
        // Data flows between actions
        flow read.output to validate.data;
        flow read.output to process.input;
        flow process.output to send.input;
    }
    
    // State-based behavior
    state def SystemStates {
        doc /* System operational states */
        entry; then idle;
        
        state idle {
            doc /* Idle state waiting for activation */
        }
        
        state active {
            doc /* Active control state */
        }
        
        state error {
            doc /* Error state when validation fails */
        }
        
        transition idle_to_active
            first idle
            then active;
            
        transition active_to_error
            first active
            then error;
            
        transition error_to_idle
            first error
            then idle;
    }
}
