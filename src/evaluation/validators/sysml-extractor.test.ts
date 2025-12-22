import { describe, test, expect } from "bun:test";
import {
  extractSysmlComponents,
  extractPartDefNames,
  extractPortDefNames,
  extractRequirementNames,
  extractStateNames,
  extractActionNames,
  compareExtracted,
  type ExtractedModel,
} from "./sysml-extractor.js";

describe("SysML v2 Component Extractor", () => {
  describe("extractSysmlComponents", () => {
    describe("package extraction", () => {
      test("extracts package names", () => {
        const input = `
          package VehicleModel {
            package Subsystems {
            }
          }
        `;
        const result = extractSysmlComponents(input);
        expect(result.packages).toHaveLength(2);
        expect(result.packages[0]!.name).toBe("VehicleModel");
        expect(result.packages[1]!.name).toBe("Subsystems");
      });

      test("extracts imports from packages", () => {
        const input = `
          package VehicleModel {
            import ScalarValues::*;
            import ISQ::MassValue;
          }
        `;
        const result = extractSysmlComponents(input);
        expect(result.packages[0]!.imports).toContain("ScalarValues::*");
        expect(result.packages[0]!.imports).toContain("ISQ::MassValue");
      });
    });

    describe("part def extraction", () => {
      test("extracts part def names", () => {
        const input = `
          package Vehicle {
            part def Engine;
            part def Wheel;
            part def Body;
          }
        `;
        const result = extractSysmlComponents(input);
        expect(result.partDefs).toHaveLength(3);
        expect(result.partDefs.map((p) => p.name)).toEqual(["Engine", "Wheel", "Body"]);
      });

      test("extracts parent from specialization", () => {
        const input = `
          part def ElectricEngine :> Engine {
          }
        `;
        const result = extractSysmlComponents(input);
        expect(result.partDefs[0]!.name).toBe("ElectricEngine");
        expect(result.partDefs[0]!.parent).toBe("Engine");
      });

      test("extracts attributes from part def", () => {
        const input = `
          part def Engine {
            attribute power : Real;
            attribute displacement : Real;
            attribute cylinders : Integer;
          }
        `;
        const result = extractSysmlComponents(input);
        expect(result.partDefs[0]!.attributes).toContain("power");
        expect(result.partDefs[0]!.attributes).toContain("displacement");
        expect(result.partDefs[0]!.attributes).toContain("cylinders");
      });

      test("extracts ports from part def", () => {
        const input = `
          part def Engine {
            port fuelIn : FuelPort;
            port exhaustOut : ExhaustPort;
          }
        `;
        const result = extractSysmlComponents(input);
        expect(result.partDefs[0]!.ports).toContain("fuelIn");
        expect(result.partDefs[0]!.ports).toContain("exhaustOut");
      });

      test("extracts nested parts from part def", () => {
        const input = `
          part def Engine {
            part piston1 : Piston;
            part piston2 : Piston;
          }
        `;
        const result = extractSysmlComponents(input);
        expect(result.partDefs[0]!.parts).toContain("piston1");
        expect(result.partDefs[0]!.parts).toContain("piston2");
      });
    });

    describe("part extraction", () => {
      test("extracts part usages", () => {
        const input = `
          part vehicle : Vehicle {
            part engine : Engine;
            part transmission : Transmission;
          }
        `;
        const result = extractSysmlComponents(input);
        expect(result.parts).toHaveLength(3);
        expect(result.parts.map((p) => p.name)).toContain("vehicle");
        expect(result.parts.map((p) => p.name)).toContain("engine");
      });

      test("extracts part types", () => {
        const input = `
          part engine : Engine;
        `;
        const result = extractSysmlComponents(input);
        expect(result.parts[0]!.name).toBe("engine");
        expect(result.parts[0]!.type).toBe("Engine");
      });

      test("extracts multiplicity", () => {
        const input = `
          part wheels : Wheel[4];
        `;
        const result = extractSysmlComponents(input);
        expect(result.parts[0]!.multiplicity).toBe("4");
      });
    });

    describe("port def extraction", () => {
      test("extracts port def names", () => {
        const input = `
          port def FuelPort;
          port def ElectricalPort;
        `;
        const result = extractSysmlComponents(input);
        expect(result.portDefs).toHaveLength(2);
        expect(result.portDefs.map((p) => p.name)).toEqual(["FuelPort", "ElectricalPort"]);
      });

      test("extracts attributes from port def", () => {
        const input = `
          port def FuelPort {
            attribute flowRate : Real;
          }
        `;
        const result = extractSysmlComponents(input);
        expect(result.portDefs[0]!.attributes).toContain("flowRate");
      });
    });

    describe("port extraction", () => {
      test("extracts port usages with direction", () => {
        const input = `
          in port fuelIn : FuelPort;
          out port exhaustOut : ExhaustPort;
          inout port dataPort : DataPort;
        `;
        const result = extractSysmlComponents(input);
        expect(result.ports).toHaveLength(3);
        expect(result.ports[0]!.direction).toBe("in");
        expect(result.ports[1]!.direction).toBe("out");
        expect(result.ports[2]!.direction).toBe("inout");
      });
    });

    describe("attribute extraction", () => {
      test("extracts attribute names and types", () => {
        const input = `
          attribute mass : Real;
          attribute name : String;
          attribute count : Integer;
        `;
        const result = extractSysmlComponents(input);
        expect(result.attributes).toHaveLength(3);
        expect(result.attributes[0]!.name).toBe("mass");
        expect(result.attributes[0]!.type).toBe("Real");
      });

      test("extracts attribute default values", () => {
        const input = `
          attribute count : Integer = 5;
          attribute name = "default";
        `;
        const result = extractSysmlComponents(input);
        expect(result.attributes[0]!.defaultValue).toBe("5");
        expect(result.attributes[1]!.defaultValue).toBe('"default"');
      });
    });

    describe("connection extraction", () => {
      test("extracts connect statements", () => {
        const input = `
          connect engine.fuelIn to fuelSystem.output;
        `;
        const result = extractSysmlComponents(input);
        expect(result.connections).toHaveLength(1);
        expect(result.connections[0]!.source).toBe("engine.fuelIn");
        expect(result.connections[0]!.target).toBe("fuelSystem.output");
      });

      test("extracts named connections", () => {
        const input = `
          connect fuelLine engine.fuelIn to fuelSystem.output;
        `;
        const result = extractSysmlComponents(input);
        expect(result.connections[0]!.name).toBe("fuelLine");
      });

      test("extracts bind statements", () => {
        const input = `
          bind vehicle.mass = engine.mass + body.mass;
        `;
        const result = extractSysmlComponents(input);
        expect(result.connections).toHaveLength(1);
        expect(result.connections[0]!.source).toBe("vehicle.mass");
      });
    });

    describe("requirement extraction", () => {
      test("extracts requirement def names", () => {
        const input = `
          requirement def SafetyRequirement;
          requirement def PerformanceRequirement;
        `;
        const result = extractSysmlComponents(input);
        expect(result.requirements).toHaveLength(2);
        expect(result.requirements.map((r) => r.name)).toContain("SafetyRequirement");
      });

      test("extracts requirement with ID", () => {
        const input = `
          requirement def <'REQ-001'> SafetyRequirement {
          }
        `;
        const result = extractSysmlComponents(input);
        expect(result.requirements[0]!.id).toBe("REQ-001");
        expect(result.requirements[0]!.name).toBe("SafetyRequirement");
      });

      test("extracts requirement parent", () => {
        const input = `
          requirement speedLimit :> PerformanceRequirement {
          }
        `;
        const result = extractSysmlComponents(input);
        expect(result.requirements[0]!.parent).toBe("PerformanceRequirement");
      });
    });

    describe("state extraction", () => {
      test("extracts state def names", () => {
        const input = `
          state def EngineState {
            state off;
            state running;
            state idle;
          }
        `;
        const result = extractSysmlComponents(input);
        const names = result.states.map((s) => s.name);
        expect(names).toContain("EngineState");
        expect(names).toContain("off");
        expect(names).toContain("running");
        expect(names).toContain("idle");
      });

      test("extracts entry/exit actions", () => {
        const input = `
          state running {
            entry startFuelPump;
            exit stopFuelPump;
            do monitorTemperature;
          }
        `;
        const result = extractSysmlComponents(input);
        const runningState = result.states.find((s) => s.name === "running");
        expect(runningState?.entryAction).toBe("startFuelPump");
        expect(runningState?.exitAction).toBe("stopFuelPump");
        expect(runningState?.doAction).toBe("monitorTemperature");
      });

      test("detects initial state with first keyword", () => {
        const input = `
          state def EngineState {
            first state off;
            state running;
          }
        `;
        const result = extractSysmlComponents(input);
        const offState = result.states.find((s) => s.name === "off");
        const runningState = result.states.find((s) => s.name === "running");
        expect(offState?.isInitial).toBe(true);
        expect(runningState?.isInitial).toBe(false);
      });
    });

    describe("transition extraction", () => {
      test("extracts transitions", () => {
        const input = `
          transition off accept start then running;
        `;
        const result = extractSysmlComponents(input);
        expect(result.transitions).toHaveLength(1);
        expect(result.transitions[0]!.source).toBe("off");
        expect(result.transitions[0]!.trigger).toBe("start");
        expect(result.transitions[0]!.target).toBe("running");
      });

      test("extracts named transitions", () => {
        const input = `
          transition startup first off accept start then running;
        `;
        const result = extractSysmlComponents(input);
        expect(result.transitions[0]!.name).toBe("startup");
      });

      test("extracts successions", () => {
        const input = `
          succession off then running;
        `;
        const result = extractSysmlComponents(input);
        expect(result.transitions[0]!.source).toBe("off");
        expect(result.transitions[0]!.target).toBe("running");
      });

      test("extracts transition guards", () => {
        const input = `
          transition off accept start [isReady] then running;
        `;
        const result = extractSysmlComponents(input);
        expect(result.transitions[0]!.source).toBe("off");
        expect(result.transitions[0]!.trigger).toBe("start");
        expect(result.transitions[0]!.guard).toBe("isReady");
        expect(result.transitions[0]!.target).toBe("running");
      });
    });

    describe("action extraction", () => {
      test("extracts action def names", () => {
        const input = `
          action def StartEngine;
          action def StopEngine;
        `;
        const result = extractSysmlComponents(input);
        expect(result.actions).toHaveLength(2);
        expect(result.actions.map((a) => a.name)).toContain("StartEngine");
      });

      test("extracts action inputs and outputs", () => {
        const input = `
          action def Process {
            in dataIn : Data;
            out resultOut : Result;
          }
        `;
        const result = extractSysmlComponents(input);
        expect(result.actions[0]!.inputs).toContain("dataIn");
        expect(result.actions[0]!.outputs).toContain("resultOut");
      });
    });

    describe("complex model", () => {
      test("extracts all elements from a complete model", () => {
        const input = `
          package VehicleModel {
            import ScalarValues::*;
            
            part def Vehicle {
              attribute mass : Real;
              
              part engine : Engine;
              part transmission : Transmission;
              
              port fuelPort : FuelPort;
            }
            
            part def Engine {
              attribute power : Real;
              
              state def EngineState {
                state off;
                state running;
                
                transition off accept start then running;
              }
            }
            
            port def FuelPort {
              attribute flowRate : Real;
            }
            
            requirement def SafetyReq {
            }
            
            action def StartEngine {
              in key : Key;
            }
            
            connect vehicle.fuelPort to fuelTank.output;
          }
        `;
        const result = extractSysmlComponents(input);

        expect(result.packages.length).toBeGreaterThan(0);
        expect(result.partDefs.length).toBeGreaterThan(0);
        expect(result.portDefs.length).toBeGreaterThan(0);
        expect(result.requirements.length).toBeGreaterThan(0);
        expect(result.states.length).toBeGreaterThan(0);
        expect(result.actions.length).toBeGreaterThan(0);
      });
    });
  });

  describe("helper functions", () => {
    test("extractPartDefNames returns just names", () => {
      const input = `
        part def Engine;
        part def Wheel;
      `;
      const names = extractPartDefNames(input);
      expect(names).toEqual(["Engine", "Wheel"]);
    });

    test("extractPortDefNames returns just names", () => {
      const input = `
        port def FuelPort;
        port def DataPort;
      `;
      const names = extractPortDefNames(input);
      expect(names).toEqual(["FuelPort", "DataPort"]);
    });

    test("extractRequirementNames returns just names", () => {
      const input = `
        requirement def SafetyReq;
        requirement speedReq;
      `;
      const names = extractRequirementNames(input);
      expect(names).toEqual(["SafetyReq", "speedReq"]);
    });

    test("extractStateNames returns just names", () => {
      const input = `
        state off;
        state running;
      `;
      const names = extractStateNames(input);
      expect(names).toEqual(["off", "running"]);
    });

    test("extractActionNames returns just names", () => {
      const input = `
        action def Start;
        action def Stop;
      `;
      const names = extractActionNames(input);
      expect(names).toEqual(["Start", "Stop"]);
    });
  });

  describe("compareExtracted", () => {
    test("returns 1.0 for identical models", () => {
      const model: ExtractedModel = {
        packages: [{ name: "Test", imports: [] }],
        partDefs: [{ name: "A", attributes: [], ports: [], actions: [], parts: [] }],
        parts: [],
        portDefs: [],
        ports: [],
        attributes: [],
        connections: [],
        requirements: [],
        states: [],
        transitions: [],
        actions: [],
      };

      const result = compareExtracted(model, model);
      expect(result.matchRatio).toBe(1);
      expect(result.missing).toHaveLength(0);
      expect(result.extra).toHaveLength(0);
    });

    test("identifies missing elements", () => {
      const expected: ExtractedModel = {
        packages: [],
        partDefs: [
          { name: "A", attributes: [], ports: [], actions: [], parts: [] },
          { name: "B", attributes: [], ports: [], actions: [], parts: [] },
        ],
        parts: [],
        portDefs: [],
        ports: [],
        attributes: [],
        connections: [],
        requirements: [],
        states: [],
        transitions: [],
        actions: [],
      };

      const actual: ExtractedModel = {
        packages: [],
        partDefs: [{ name: "A", attributes: [], ports: [], actions: [], parts: [] }],
        parts: [],
        portDefs: [],
        ports: [],
        attributes: [],
        connections: [],
        requirements: [],
        states: [],
        transitions: [],
        actions: [],
      };

      const result = compareExtracted(expected, actual);
      expect(result.matchRatio).toBe(0.5);
      expect(result.missing).toContain("partDefs:B");
    });

    test("identifies extra elements", () => {
      const expected: ExtractedModel = {
        packages: [],
        partDefs: [{ name: "A", attributes: [], ports: [], actions: [], parts: [] }],
        parts: [],
        portDefs: [],
        ports: [],
        attributes: [],
        connections: [],
        requirements: [],
        states: [],
        transitions: [],
        actions: [],
      };

      const actual: ExtractedModel = {
        packages: [],
        partDefs: [
          { name: "A", attributes: [], ports: [], actions: [], parts: [] },
          { name: "C", attributes: [], ports: [], actions: [], parts: [] },
        ],
        parts: [],
        portDefs: [],
        ports: [],
        attributes: [],
        connections: [],
        requirements: [],
        states: [],
        transitions: [],
        actions: [],
      };

      const result = compareExtracted(expected, actual);
      expect(result.matchRatio).toBe(1); // All expected items found
      expect(result.extra).toContain("partDefs:C");
    });

    test("supports ignoreCase option", () => {
      const expected: ExtractedModel = {
        packages: [],
        partDefs: [{ name: "Engine", attributes: [], ports: [], actions: [], parts: [] }],
        parts: [],
        portDefs: [],
        ports: [],
        attributes: [],
        connections: [],
        requirements: [],
        states: [],
        transitions: [],
        actions: [],
      };

      const actual: ExtractedModel = {
        packages: [],
        partDefs: [{ name: "engine", attributes: [], ports: [], actions: [], parts: [] }],
        parts: [],
        portDefs: [],
        ports: [],
        attributes: [],
        connections: [],
        requirements: [],
        states: [],
        transitions: [],
        actions: [],
      };

      // Without ignoreCase, should not match
      const result1 = compareExtracted(expected, actual);
      expect(result1.matchRatio).toBe(0);

      // With ignoreCase, should match
      const result2 = compareExtracted(expected, actual, { ignoreCase: true });
      expect(result2.matchRatio).toBe(1);
    });

    test("handles connections without names using source->target key", () => {
      const model: ExtractedModel = {
        packages: [],
        partDefs: [],
        parts: [],
        portDefs: [],
        ports: [],
        attributes: [],
        connections: [{ source: "a.port1", target: "b.port2" }],
        requirements: [],
        states: [],
        transitions: [],
        actions: [],
      };

      const result = compareExtracted(model, model);
      expect(result.matchRatio).toBe(1);
      expect(result.matched).toContain("connections:a.port1->b.port2");
    });
  });
});
