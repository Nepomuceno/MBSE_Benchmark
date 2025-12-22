import { describe, test, expect } from "bun:test";
import {
  validateSysmlSyntax,
  isValidSysmlSyntax,
  SYSML_V2_KEYWORDS,
} from "./sysml-syntax.js";

describe("SysML v2 Syntax Validator", () => {
  describe("validateSysmlSyntax", () => {
    describe("brace matching", () => {
      test("validates matching braces", () => {
        const input = `
          package Vehicle {
            part def Engine {
              attribute power : Real;
            }
          }
        `;
        const result = validateSysmlSyntax(input);
        expect(result.valid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });

      test("detects unclosed brace", () => {
        const input = `
          package Vehicle {
            part def Engine {
              attribute power : Real;
          }
        `;
        const result = validateSysmlSyntax(input);
        expect(result.valid).toBe(false);
        expect(result.errors.length).toBeGreaterThan(0);
        expect(result.errors.some((e) => e.message.includes("Unclosed"))).toBe(true);
      });

      test("detects extra closing brace", () => {
        const input = `
          package Vehicle {
            part def Engine {
            }
          }}
        `;
        const result = validateSysmlSyntax(input);
        expect(result.valid).toBe(false);
        expect(result.errors.some((e) => e.message.includes("Unexpected closing"))).toBe(true);
      });

      test("detects mismatched braces", () => {
        const input = `
          package Vehicle {
            part def Engine (
            }
          )
        `;
        const result = validateSysmlSyntax(input);
        expect(result.valid).toBe(false);
        expect(result.errors.some((e) => e.message.includes("Mismatched"))).toBe(true);
      });

      test("ignores braces in strings", () => {
        const input = `
          package Vehicle {
            doc /* doc */ "This has { and } in it";
          }
        `;
        const result = validateSysmlSyntax(input);
        expect(result.valid).toBe(true);
      });

      test("ignores braces in comments", () => {
        const input = `
          package Vehicle {
            // This has { in a comment
            /* And this { too } */
          }
        `;
        const result = validateSysmlSyntax(input);
        expect(result.valid).toBe(true);
      });
    });

    describe("keyword validation", () => {
      test("accepts valid SysML keywords", () => {
        const input = `
          package Vehicle {
            part def Engine {
              attribute power : Real;
              port fuelIn : FuelPort;
            }
            action def StartEngine;
            state def Running;
            requirement def SafetyReq;
          }
        `;
        const result = validateSysmlSyntax(input);
        expect(result.valid).toBe(true);
      });

      test("warns about unknown keywords that look like definitions", () => {
        const input = `
          package Vehicle {
            component Engine {
              attribute power : Real;
            }
          }
        `;
        const result = validateSysmlSyntax(input);
        // Should have warnings about 'component' which isn't a SysML keyword
        expect(result.warnings.some((w) => w.message.includes("Unknown keyword"))).toBe(true);
      });
    });

    describe("structure validation", () => {
      test("validates import syntax", () => {
        const input = `
          package Vehicle {
            import ScalarValues::*;
            import ISQ::*;
          }
        `;
        const result = validateSysmlSyntax(input);
        expect(result.valid).toBe(true);
      });

      test("detects import without semicolon", () => {
        const input = `
          package Vehicle {
            import ScalarValues::*
          }
        `;
        const result = validateSysmlSyntax(input);
        expect(result.valid).toBe(false);
        expect(result.errors.some((e) => e.message.includes("semicolon"))).toBe(true);
      });
    });

    describe("element counting", () => {
      test("counts packages", () => {
        const input = `
          package A {
            package B {
            }
          }
          package C {
          }
        `;
        const result = validateSysmlSyntax(input);
        expect(result.elements.packages).toBe(3);
      });

      test("counts part defs and parts", () => {
        const input = `
          package Vehicle {
            part def Engine;
            part def Wheel;
            part engine : Engine;
            part frontLeft : Wheel;
            part frontRight : Wheel;
          }
        `;
        const result = validateSysmlSyntax(input);
        expect(result.elements.partDefs).toBe(2);
        expect(result.elements.parts).toBe(3);
      });

      test("counts port defs and ports", () => {
        const input = `
          package System {
            port def DataPort;
            port def PowerPort;
            part def Component {
              port input : DataPort;
              port output : DataPort;
            }
          }
        `;
        const result = validateSysmlSyntax(input);
        expect(result.elements.portDefs).toBe(2);
        expect(result.elements.ports).toBe(2);
      });

      test("counts actions and states", () => {
        const input = `
          package System {
            action def Initialize;
            action def Process;
            state def Idle;
            state def Running;
            state def Stopped;
          }
        `;
        const result = validateSysmlSyntax(input);
        expect(result.elements.actions).toBe(2);
        expect(result.elements.states).toBe(3);
      });

      test("counts requirements", () => {
        const input = `
          package Requirements {
            requirement def SafetyReq;
            requirement def PerformanceReq;
            requirement safetyReq1 : SafetyReq;
          }
        `;
        const result = validateSysmlSyntax(input);
        expect(result.elements.requirements).toBe(3);
      });

      test("ignores elements in comments", () => {
        const input = `
          package System {
            // part def CommentedOut;
            /* 
             * part def AlsoCommented;
             */
            part def Real;
          }
        `;
        const result = validateSysmlSyntax(input);
        expect(result.elements.partDefs).toBe(1);
      });
    });

    describe("complex models", () => {
      test("validates a complete vehicle model", () => {
        const input = `
          package VehicleModel {
            import ScalarValues::*;
            import ISQ::*;
            
            part def Vehicle {
              attribute mass : Real;
              attribute maxSpeed : Real;
              
              part engine : Engine;
              part transmission : Transmission;
              
              port fuelPort : FuelPort;
            }
            
            part def Engine {
              attribute power : Real;
              attribute displacement : Real;
              
              state def EngineState {
                state off;
                state running;
                state idle;
              }
            }
            
            part def Transmission {
              attribute gearCount : Integer;
            }
            
            port def FuelPort {
              in item fuel : Fuel;
            }
            
            item def Fuel {
              attribute octane : Integer;
            }
          }
        `;
        const result = validateSysmlSyntax(input);
        expect(result.valid).toBe(true);
        expect(result.elements.packages).toBe(1);
        expect(result.elements.partDefs).toBeGreaterThan(0);
      });
    });
  });

  describe("isValidSysmlSyntax", () => {
    test("returns true for valid syntax", () => {
      const input = `package Test { part def A; }`;
      expect(isValidSysmlSyntax(input)).toBe(true);
    });

    test("returns false for invalid syntax", () => {
      const input = `package Test { part def A; `;
      expect(isValidSysmlSyntax(input)).toBe(false);
    });
  });

  describe("SYSML_V2_KEYWORDS", () => {
    test("contains essential keywords", () => {
      expect(SYSML_V2_KEYWORDS).toContain("package");
      expect(SYSML_V2_KEYWORDS).toContain("part");
      expect(SYSML_V2_KEYWORDS).toContain("part def");
      expect(SYSML_V2_KEYWORDS).toContain("port");
      expect(SYSML_V2_KEYWORDS).toContain("port def");
      expect(SYSML_V2_KEYWORDS).toContain("attribute");
      expect(SYSML_V2_KEYWORDS).toContain("action");
      expect(SYSML_V2_KEYWORDS).toContain("state");
      expect(SYSML_V2_KEYWORDS).toContain("requirement");
      expect(SYSML_V2_KEYWORDS).toContain("constraint");
      expect(SYSML_V2_KEYWORDS).toContain("import");
    });
  });
});
