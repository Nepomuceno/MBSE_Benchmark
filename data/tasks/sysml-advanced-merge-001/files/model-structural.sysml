package StructuralDefinitions {
    doc /* Structural definitions for a control system - parts, ports, and interfaces */
    
    // Port definitions for data flow
    port def SensorPort {
        doc /* Port for sensor data output */
        out item reading : Real;
    }
    
    port def ActuatorPort {
        doc /* Port for actuator command input */
        in item command : Real;
    }
    
    port def DataPort {
        doc /* Generic data port */
        out item data : Real;
    }
    
    // Part definitions for system components
    part def Controller {
        doc /* Main controller that processes sensor data and commands actuators */
        port sensorIn : SensorPort;
        port actuatorOut : ActuatorPort;
        attribute cycleTime : Real;
    }
    
    part def Sensor {
        doc /* Sensor that reads environmental data */
        port dataOut : ~SensorPort;
        attribute sensorType : String;
        attribute range : Real;
    }
    
    part def Actuator {
        doc /* Actuator that executes commands */
        port commandIn : ~ActuatorPort;
        attribute actuatorType : String;
        attribute maxForce : Real;
    }
    
    // System assembly (partial - no behavior connected yet)
    part system {
        doc /* System assembly with sensors, controller, and actuators */
        part controller : Controller;
        part tempSensor : Sensor;
        part motor : Actuator;
        
        // Structural connections
        connect tempSensor.dataOut to controller.sensorIn;
        connect controller.actuatorOut to motor.commandIn;
    }
}
