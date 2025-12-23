# GEN-014: Signal and Message Definition Generation

## Expected Output Pattern

```sysml
package CommunicationProtocol {
    attribute def StartCommand {
        attribute commandId : Integer;
    }

    attribute def StopCommand {
        attribute commandId : Integer;
    }

    attribute def StatusReport {
        attribute status : String;
        attribute timestamp : Integer;
    }

    port def ControllerPort {
        out startCmd : StartCommand;
        out stopCmd : StopCommand;
        in statusReport : StatusReport;
    }

    port def DevicePort {
        in startCmd : StartCommand;
        in stopCmd : StopCommand;
        out statusReport : StatusReport;
    }

    part def CommunicationExample {
        part controller {
            port ctrlPort : ControllerPort;
        }
        
        part device {
            port devPort : DevicePort;
        }
        
        message startMsg of StartCommand from controller.ctrlPort to device.devPort;
        message statusMsg of StatusReport from device.devPort to controller.ctrlPort;
    }
}
```

## Notes

- Tests ability to create signal definitions using attribute defs
- Ports should specify signal types with directionality
- Message statements connect ports with specific signal types
