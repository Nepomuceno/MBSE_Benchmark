# Requirement Derivation Task

This task tests the AI's ability to derive component-level requirements from system-level requirements with proper traceability.

## Expected Output

The AI should generate SysML v2 requirement definitions for three components, derived from system requirements:

### 1. Compressor Unit Requirements

Should derive from:

- CoolingFunctionReqDef (primary)
- PowerConsumptionReqDef (secondary)

Example attributes:

- coolingCapacity
- powerConsumption
- outputTemperature

### 2. Temperature Sensor Requirements

Should derive from:

- TemperatureRegulationReqDef (primary)
- PerformanceReqDef (response time)

Example attributes:

- measurementAccuracy
- responseTime
- temperatureRange

### 3. Control Unit Requirements

Should derive from:

- PerformanceReqDef (primary)
- UserInterfaceReqDef (secondary)

Example attributes:

- processingTime
- inputResponseTime
- controlAccuracy

## Key Evaluation Points

- Valid SysML v2 syntax for requirement definitions
- Proper use of `derive from` relationships
- Logical decomposition of system requirements to component level
- Appropriate attributes and constraints for each component
- Clear traceability from component to system requirements
