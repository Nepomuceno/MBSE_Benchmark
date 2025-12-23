# GEN-006: Complete Subsystem Generation

## Expected Output Pattern

```sysml
package GPSNavigationSubsystem {
    import ISQ::*;
    import ScalarValues::*;

    part def GPSReceiver {
        attribute accuracy : ISQ::LengthValue;
        port gpsOut;
    }

    part def MapDisplay {
        attribute resolution : Integer;
        port displayIn;
        port userIn;
    }

    part def RouteCalculator {
        attribute maxWaypoints : Integer;
        port gpsIn;
        port mapOut;
    }

    part def NavigationSubsystem {
        part receiver : GPSReceiver;
        part display : MapDisplay;
        part calculator : RouteCalculator;
        
        connect receiver.gpsOut to calculator.gpsIn;
        connect calculator.mapOut to display.displayIn;
    }

    requirement def PositionAccuracyReq {
        doc /* GPS accuracy shall be within 5 meters */
        attribute accuracy : ISQ::LengthValue;
        require constraint { accuracy <= 5[m] }
    }

    requirement def ResponseTimeReq {
        doc /* Route calculation shall complete within 2 seconds */
        attribute responseTime : ISQ::TimeValue;
        require constraint { responseTime <= 2[s] }
    }
}
```

## Notes

- Tests ability to create complete subsystem
- Must integrate multiple component types
- Connections should link ports properly
- Requirements provide constraints on system behavior
