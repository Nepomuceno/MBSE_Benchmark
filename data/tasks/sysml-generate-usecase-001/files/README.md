# GEN-008: Use Case Definition Generation

## Expected Output Pattern

```sysml
package HomeSecurityUseCases {
    use case def ArmSystem {
        subject securityPanel : SecurityPanel;
        actor homeowner : Homeowner;
        
        objective {
            doc /* Enable security monitoring by arming the system */
        }
    }

    use case def DetectIntrusion {
        subject alarmController : AlarmController;
        actor intrusionSensor : IntrusionSensor;
        
        objective {
            doc /* Detect unauthorized entry and trigger alarm response */
        }
    }

    use case def NotifyAuthorities {
        subject monitoringService : MonitoringService;
        actor alarmController : AlarmController;
        
        objective {
            doc /* Alert emergency services when intrusion is detected */
        }
    }
}
```

## Notes

- Tests ability to create use case definitions
- Must include subject and actor roles
- Objective should describe the use case purpose
