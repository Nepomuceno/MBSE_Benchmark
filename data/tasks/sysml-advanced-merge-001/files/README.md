# Expected Merged Model

This file provides an example of what a well-integrated merged model should look like.

## Key Integration Points

### 1. Package Organization

The merged model should organize both structural and behavioral elements, either by:

- Importing both packages into a unified package
- Creating a new integration package that imports both
- Merging into a single package with clear organization

### 2. Behavior-Structure Integration

Connect behavioral elements to structural parts:

- **ControlLoop action** should be performed by the **Controller part**
- **SystemStates** should be allocated to the **system part** or Controller
- Actions should reference appropriate ports for data flow

### 3. Type Compatibility

Ensure consistency:

- Action parameters (Real type) match port data types (Real)
- ReadSensor output should be compatible with SensorPort reading
- SendCommand input should be compatible with ActuatorPort command

### 4. Assumptions to Document

Expected assumptions:

- How frequently ControlLoop executes
- Mapping between action flows and physical port connections
- State transitions triggered by validation results
- Timing and synchronization between structural connections and behavioral flows

## Example Merged Model Structure

```sysml
package IntegratedControlSystem {
    import StructuralDefinitions::*;
    import BehavioralDefinitions::*;
    
    doc /* Merged control system with integrated structure and behavior */
    
    // Enhanced Controller with behavior
    part def EnhancedController :> Controller {
        // Link control behavior to controller
        perform controlLoop : ControlLoop;
        exhibit states : SystemStates;
    }
    
    // Integrated system
    part integratedSystem :> system {
        part controller : EnhancedController {
            :>> cycleTime = 0.1;  // 100ms control cycle
        }
        
        // Connections inherited from structural model
        // Behavior now active within controller
    }
}

/* Integration Assumptions:
 * 1. ControlLoop executes continuously at the controller's cycleTime rate
 * 2. ReadSensor action reads from controller.sensorIn port
 * 3. SendCommand action writes to controller.actuatorOut port
 * 4. SystemStates transitions are triggered by ValidateInput results:
 *    - idle -> active when system starts
 *    - active -> error when validate.valid = false
 *    - error -> idle after error recovery
 * 5. Action flow semantics (flow connections) represent logical data flow
 *    while port connections represent physical/interface connections
 */
```

## Quality Criteria

A good merged model should:

1. **Be syntactically valid** - No syntax errors, proper SysML v2 structure
2. **Preserve all elements** - Nothing lost from either source model
3. **Add integration constructs** - Use `perform`, `exhibit`, or similar to link behavior to structure
4. **Resolve conflicts clearly** - Any renamed elements should be documented
5. **Document assumptions** - Clear comments explaining design decisions
6. **Maintain semantic consistency** - Type compatibility, logical coherence

## Common Mistakes to Avoid

- Simply concatenating both models without integration
- Ignoring type mismatches between actions and ports
- Not documenting how behavior relates to structure
- Creating conflicts by duplicating element names
- Missing imports or references
- Not explaining assumptions made during merge

## Validation Points

The merged model should:

- Parse without errors (syntactic validity)
- Have all references resolved (no dangling references)
- Show clear `perform` or similar relationships linking behavior to parts
- Include comments documenting integration decisions
- Maintain logical consistency between flows and connections
