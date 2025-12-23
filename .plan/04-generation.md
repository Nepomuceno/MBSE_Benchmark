# Category 4: Model Generation Tasks

## Goal

Test AI's ability to generate valid SysML v2 models from natural language requirements.

## Tasks

### Task GEN-001: Simple Part Definition

- **ID**: `sysml-generate-part-001`
- **Type**: `generation`
- **Difficulty**: Easy
- **Description**: Generate a simple part definition from requirements
- **Prompt**: "Create a SysML v2 part definition for a 'SmartThermostat' with the following attributes: currentTemperature (temperature value), targetTemperature (temperature value), isHeating (boolean), isCooling (boolean). Include appropriate imports."
- **Expected Output Pattern**:

```sysml
package SmartThermostat {
    import ISQ::*;
    import ScalarValues::*;

    part def SmartThermostat {
        attribute currentTemperature :> ISQ::temperature;
        attribute targetTemperature :> ISQ::temperature;
        attribute isHeating : Boolean;
        attribute isCooling : Boolean;
    }
}
```

- **Evaluation**:
  - Type: `sysml-validation` (custom validator)
  - Check: Valid syntax + required elements
  - Weight: 1.0

### Task GEN-002: Port and Interface Generation

- **ID**: `sysml-generate-ports-001`
- **Type**: `generation`
- **Difficulty**: Medium
- **Description**: Generate ports and interfaces for communication
- **Prompt**: "Create SysML v2 port and interface definitions for a sensor system: (1) A SensorPort that outputs temperature and humidity values, (2) A ControlPort that accepts setpoint commands, (3) An interface definition connecting sensor to controller."
- **Expected**: Valid port defs with in/out items, interface def with ends
- **Evaluation**:
  - Type: `sysml-validation`
  - Check: Valid syntax + ports + interface structure
  - Weight: 1.5

### Task GEN-003: Requirement Generation

- **ID**: `sysml-generate-requirements-001`
- **Type**: `generation`
- **Difficulty**: Medium
- **Description**: Generate SysML v2 requirements from natural language
- **Prompt**: "Convert these requirements to SysML v2 requirement definitions:
  1. The battery shall have minimum 80% capacity after 500 charge cycles
  2. The system shall respond to user input within 100 milliseconds
  3. Operating temperature range shall be -20°C to 50°C
  Include doc strings and constraint expressions."
- **Expected**: Three requirement defs with attributes and constraints
- **Evaluation**:
  - Type: `llm-judge`
  - Criteria: `["syntax_validity", "requirement_completeness", "constraint_correctness"]`
  - Weight: 2.0

### Task GEN-004: State Machine Generation

- **ID**: `sysml-generate-states-001`
- **Type**: `generation`
- **Difficulty**: Hard
- **Description**: Generate a state machine from a state description
- **Prompt**: "Create a SysML v2 state definition for a traffic light controller with states: Red, Yellow, Green. Transitions: Red→Green (after 30s), Green→Yellow (after 25s), Yellow→Red (after 5s). Also include an emergency state accessible from any state via EmergencySignal."
- **Expected**: State def with states, transitions, time events
- **Evaluation**:
  - Type: `llm-judge`
  - Criteria: `["state_completeness", "transition_accuracy", "syntax_validity"]`
  - Weight: 2.5

### Task GEN-005: Action Definition Generation

- **ID**: `sysml-generate-actions-001`
- **Type**: `generation`
- **Difficulty**: Medium
- **Description**: Generate action definitions with flows
- **Prompt**: "Create SysML v2 action definitions for a coffee machine:
  1. GrindBeans: input coffee beans, output ground coffee
  2. BrewCoffee: input ground coffee and water, output brewed coffee
  3. MakeCoffee: combines GrindBeans and BrewCoffee with proper flows
  Include all necessary action defs and a composite action with internal flows."
- **Expected**: Action defs with in/out parameters and flow connections
- **Evaluation**:
  - Type: `llm-judge`
  - Criteria: `["action_structure", "flow_correctness", "composability"]`
  - Weight: 2.0

### Task GEN-006: Complete Subsystem Generation

- **ID**: `sysml-generate-subsystem-001`
- **Type**: `generation`
- **Difficulty**: Hard
- **Description**: Generate a complete subsystem model
- **Prompt**: "Generate a SysML v2 model for a GPS Navigation Subsystem including:
  - Part definitions: GPSReceiver, MapDisplay, RouteCalculator
  - Port definitions for GPS signals, user input, display output
  - Connections between components
  - At least 2 requirements with constraints
  Create a complete, syntactically valid model."
- **Expected**: Complete package with all elements, proper structure
- **Evaluation**:
  - Type: `sysml-validation` + `llm-judge`
  - Criteria: `["completeness", "syntax_validity", "architecture_quality"]`
  - Weight: 3.0

### Task GEN-007: Specialization and Variation

- **ID**: `sysml-generate-variation-001`
- **Type**: `generation`
- **Difficulty**: Hard
- **Description**: Generate a model with specialization and variations
- **Prompt**: "Create a SysML v2 model for electric vehicles with:
  1. Base 'ElectricVehicle' part def with common attributes (batteryCapacity, range, weight)
  2. Specializations: Sedan, SUV, Truck - each with specific attributes
  3. A variation for battery types: StandardBattery, ExtendedRangeBattery
  Use proper SysML v2 specialization (:>) and variation syntax."
- **Expected**: Proper use of :>, variation, variant syntax
- **Evaluation**:
  - Type: `llm-judge`
  - Criteria: `["specialization_correctness", "variation_syntax", "model_coherence"]`
  - Weight: 2.5

### Task GEN-008: Use Case Generation

- **ID**: `sysml-generate-usecase-001`
- **Type**: `generation`
- **Difficulty**: Medium
- **Description**: Generate use case definitions with actors and objectives
- **Prompt**: "Create SysML v2 use case definitions for a home security system:
  1. 'Arm System' - actor: Homeowner, subject: SecurityPanel
  2. 'Detect Intrusion' - actor: IntrusionSensor, subject: AlarmController
  3. 'Notify Authorities' - actor: AlarmController, subject: MonitoringService
  Include proper objective documentation for each use case."
- **Expected**: Valid use case defs with subject, actors, and objectives
- **Evaluation**:
  - Type: `sysml-validation` + `llm-judge`
  - Criteria: `["usecase_structure", "actor_definition", "objective_clarity"]`
  - Weight: 2.0

### Task GEN-009: Constraint Definition Generation

- **ID**: `sysml-generate-constraints-001`
- **Type**: `generation`
- **Difficulty**: Medium
- **Description**: Generate constraint definitions with mathematical expressions
- **Prompt**: "Create SysML v2 constraint definitions for physics calculations:
  1. NewtonsSecondLaw: F = m \* a (force equals mass times acceleration)
  2. KineticEnergy: KE = 0.5 \* m \* v^2
  3. PowerEquation: P = F * v (power equals force times velocity)
  Use proper ISQ types for all physical quantities."
- **Expected**: Constraint defs with proper attribute types and expressions
- **Evaluation**:
  - Type: `sysml-validation`
  - Check: Valid constraint syntax, correct ISQ types
  - Weight: 1.5

### Task GEN-010: Calculation Definition Generation

- **ID**: `sysml-generate-calc-001`
- **Type**: `generation`
- **Difficulty**: Medium
- **Description**: Generate calculation definitions with return values
- **Prompt**: "Create SysML v2 calculation definitions for a vehicle fuel economy analysis:
  1. FuelConsumption: inputs (distance, fuelUsed), returns consumption rate
  2. TotalMass: inputs (array of part masses), returns sum using NumericalFunctions
  3. Range: inputs (fuelCapacity, consumptionRate), returns maximum distance
  Include proper calc def syntax with in parameters and return."
- **Expected**: Valid calc defs with parameters and return statements
- **Evaluation**:
  - Type: `sysml-validation` + `llm-judge`
  - Criteria: `["calc_structure", "type_correctness", "computation_logic"]`
  - Weight: 2.0

### Task GEN-011: Connection and Binding Generation

- **ID**: `sysml-generate-connections-001`
- **Type**: `generation`
- **Difficulty**: Hard
- **Description**: Generate a complete connection topology
- **Prompt**: "Given these component definitions, generate the connection statements:
  - Controller with ports: sensorIn, actuatorOut
  - Sensor with port: dataOut
  - Actuator with port: commandIn
  Create:
  1. A part usage for each component
  2. Connect statements linking the ports
  3. An interface definition for sensor-to-controller communication
  Ensure all connections are properly typed."
- **Expected**: Parts with proper port connections and interface
- **Evaluation**:
  - Type: `sysml-validation`
  - Check: Valid connections, port type compatibility
  - Weight: 2.5

### Task GEN-012: Analysis Case Generation

- **ID**: `sysml-generate-analysis-001`
- **Type**: `generation`
- **Difficulty**: Hard
- **Description**: Generate a complete analysis case
- **Prompt**: "Create a SysML v2 analysis definition for thermal analysis of an electronics enclosure:
  1. Define the analysis with appropriate subject (Enclosure part)
  2. Include objective referencing temperature requirements
  3. Define input parameters: ambient temperature, power dissipation, airflow rate
  4. Include action steps for the analysis process
  5. Return calculated internal temperature
  Follow the pattern from the VehicleModel fuel economy analysis."
- **Expected**: Complete analysis def with subject, objective, actions, return
- **Evaluation**:
  - Type: `llm-judge`
  - Criteria: `["analysis_structure", "objective_definition", "parameter_completeness"]`
  - Weight: 3.0

### Task GEN-013: Individual Definition Generation

- **ID**: `sysml-generate-individual-001`
- **Type**: `generation`
- **Difficulty**: Medium
- **Description**: Generate individual definitions and usages
- **Prompt**: "Create SysML v2 individual definitions for a fleet management scenario:
  1. Define Vehicle_Type_A as a general vehicle definition
  2. Create individual def Vehicle_001, Vehicle_002 specializing Vehicle_Type_A
  3. Create individual part usages for a fleet containing these vehicles
  4. Set specific attribute values for each individual (VIN, registration date)
  Demonstrate the difference between definitions and individuals."
- **Expected**: Proper individual def and individual part syntax
- **Evaluation**:
  - Type: `sysml-validation` + `llm-judge`
  - Criteria: `["individual_syntax", "specialization_correct", "attribute_binding"]`
  - Weight: 2.0

### Task GEN-014: Message and Signal Generation

- **ID**: `sysml-generate-messages-001`
- **Type**: `generation`
- **Difficulty**: Medium
- **Description**: Generate signal definitions and message flows
- **Prompt**: "Create SysML v2 definitions for a communication protocol:
  1. Define signal types: StartCommand, StopCommand, StatusReport (with payload attributes)
  2. Define port types that send/receive these signals
  3. Create a message sequence between Controller and Device:
     - Controller sends StartCommand to Device
     - Device sends StatusReport back to Controller
  Use proper attribute def for signals and message syntax."
- **Expected**: Signal defs, ports, and message statements
- **Evaluation**:
  - Type: `sysml-validation`
  - Check: Valid signal, port, message syntax
  - Weight: 2.0

## Implementation Notes

### SysML v2 Syntax Validator

For generation tasks, implement validator that:

1. Parses output as SysML v2
2. Validates structure (matching braces, keywords)
3. Checks for required elements (specified in task)
4. Returns structured validation result

### LLM Judge Prompts

For generation evaluation, LLM judge should:

1. Compare generated model to expected structure
2. Verify semantic correctness (not just syntax)
3. Consider alternative valid representations
4. Score on multiple dimensions

### Output Normalization

Before comparison:

- Normalize whitespace and formatting
- Accept equivalent expressions
- Handle import variations (explicit vs wildcard)
- Consider naming variations (with explanations)

### File Validation

For generation tasks with file output:

- Validate file was created
- Check file contains valid SysML v2
- Extract and verify required elements
