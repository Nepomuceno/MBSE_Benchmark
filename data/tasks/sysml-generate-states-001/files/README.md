# GEN-004: State Machine Generation

## Expected Output Pattern

```sysml
package TrafficLight {
    state def TrafficLightController {
        entry; then Red;
        
        state Red;
        state Yellow;
        state Green;
        state Emergency;
        
        transition Red_to_Green
            first Red
            accept after 30[s]
            then Green;
            
        transition Green_to_Yellow
            first Green
            accept after 25[s]
            then Yellow;
            
        transition Yellow_to_Red
            first Yellow
            accept after 5[s]
            then Red;
            
        transition to_Emergency
            accept EmergencySignal
            then Emergency;
    }
}
```

## Notes

- Tests ability to create state machines with timed transitions
- Must handle both time-based and event-based transitions
- Emergency state should be accessible from any state
- Proper use of state def, transition, accept, and timing syntax
