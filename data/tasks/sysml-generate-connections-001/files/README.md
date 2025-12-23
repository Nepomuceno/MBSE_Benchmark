# GEN-011: Connection and Binding Generation

## Expected Output Pattern

```sysml
package ControlSystem {
    port def SensorPort {
        out data : Real;
    }

    port def ControllerSensorPort {
        in data : Real;
    }

    port def ControllerActuatorPort {
        out command : Real;
    }

    port def ActuatorPort {
        in command : Real;
    }

    interface def SensorInterface {
        end sensor : SensorPort;
        end controller : ControllerSensorPort;
    }

    interface def ActuatorInterface {
        end controller : ControllerActuatorPort;
        end actuator : ActuatorPort;
    }

    part def Controller {
        port sensorIn : ControllerSensorPort;
        port actuatorOut : ControllerActuatorPort;
    }

    part def Sensor {
        port dataOut : SensorPort;
    }

    part def Actuator {
        port commandIn : ActuatorPort;
    }

    part def System {
        part controller : Controller;
        part sensor : Sensor;
        part actuator : Actuator;
        
        connect sensor.dataOut to controller.sensorIn;
        connect controller.actuatorOut to actuator.commandIn;
    }
}
```

## Notes

- Tests ability to create proper connection topology
- Interfaces should define compatible port pairs
- Connections must respect port types and directionality
