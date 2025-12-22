// Snippet A
package SnippetA {
    part def Vehicle {
        attribute mass :> ISQ::mass;
        attribute velocity :> ISQ::speed;
        port fuelPort: FuelPort;
    }
    port def FuelPort {
        in item fuelCmd: FuelCmd;
    }
    item def FuelCmd;
}

// Snippet B
package SnippetB {
    part def Engine {
        attribute power :> ISQ::power
        attribute efficiency : Real;  // Missing semicolon on previous line
    }
    port def PowerPort {
        out engineTorque: Torque;
    
    // Missing closing brace for port def
}

// Snippet C
package SnippetC {
    state def StopWatch {
        entry; then ready;
        
        state ready;
        state running;
        state stopped;
        
        transition ready_to_running
            first ready
            accept StartSignal
            then running;
            
        transition running_to_stopped
            first running
            accept StopSignal
            then stopped;
    }
}

// Snippet D
packge SnippetD {  // Misspelled "package"
    requirement def MassRequirement {
        atribute massRequired :> ISQ::mass;  // Misspelled "attribute"
        attribute massActual :> ISQ::mass;
        require constraint {
            massActual <= massRequired
        }
    }
}

// Snippet E
package SnippetE {
    import ScalarValues::*;
    
    attribute def Temperature :> Real;
    attribute def Pressure :> Real;
    
    part def Sensor {
        attribute reading: Temperature;
        attribute calibrationDate: String;
    }
    
    part def PressureSensor :> Sensor {
        attribute pressureReading: Pressure;
    }
}
