package OldPatternVehicle {
    
    // Old pattern: Using connection def instead of interface def for bidirectional
    connection def PowerConnection {
        end source;
        end target;
    }
    
    // Old pattern: Direct attribute assignment instead of redefinition
    part def Battery {
        attribute voltage = 12;
        attribute capacity = 100;
    }
    
    // Old pattern: Missing port conjugation for bidirectional
    port def PowerPort {
        out power;
    }
    
    // Old pattern: Redundant connections instead of bind
    part def ElectricMotor {
        attribute power;
        port motorPower : PowerPort;
    }
    
    part def PowerController {
        attribute outputPower;
        port controllerOutput : PowerPort;
    }
    
    part vehicle {
        part battery : Battery {
            // Old pattern: inline value override
            attribute voltage = 24;
            attribute capacity = 200;
        }
        
        part motor : ElectricMotor;
        part controller : PowerController;
        
        // Old pattern: Direct connection instead of bind
        connect battery to controller;
        connect controller to motor;
        
        // Old pattern: Redundant connection for data flow
        connection powerFlow connect controller.controllerOutput to motor.motorPower;
    }
}
