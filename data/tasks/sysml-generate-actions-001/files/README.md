# GEN-005: Action Definition Generation

## Expected Output Pattern

```sysml
package CoffeeMachine {
    import ScalarValues::*;

    action def GrindBeans {
        in coffeeBeans;
        out groundCoffee;
    }

    action def BrewCoffee {
        in groundCoffee;
        in water;
        out brewedCoffee;
    }

    action def MakeCoffee {
        in beans;
        in water;
        out coffee;
        
        action grind : GrindBeans {
            in coffeeBeans = beans;
        }
        
        action brew : BrewCoffee {
            in groundCoffee = grind.groundCoffee;
            in water = MakeCoffee.water;
        }
        
        flow grind.groundCoffee to brew.groundCoffee;
        
        bind coffee = brew.brewedCoffee;
    }
}
```

## Notes

- Tests ability to create action definitions with parameters
- Composite action should connect sub-actions with flows
- Proper use of in/out parameters and flow syntax
