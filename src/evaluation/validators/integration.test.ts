/**
 * SysML Validators Integration Test
 *
 * Run with: bun run src/evaluation/validators/integration.test.ts
 *
 * This tests the complete validation pipeline with a realistic SysML model.
 */

import { describe, test, expect } from "bun:test";
import { validateSysmlSyntax } from "./sysml-syntax.js";
import { extractSysmlComponents, compareExtracted } from "./sysml-extractor.js";
import { buildStructureTree, compareStructures } from "./sysml-structure.js";
import { createSysmlValidationStrategy } from "../strategies/sysml-validation.js";
import type { Task } from "../../tasks/types.js";

// Sample SysML v2 model for testing
const VEHICLE_MODEL = `
package VehicleModel {
  import ScalarValues::*;

  part def Vehicle {
    attribute mass : Real;
    attribute maxSpeed : Real;

    part engine : Engine;
    part transmission : Transmission;
    part wheels : Wheel[4];

    port fuelPort : FuelPort;
  }

  part def Engine {
    attribute power : Real;
    attribute displacement : Real;

    port fuelIn : FuelPort;
    port driveOut : DrivePort;

    state def EngineState {
      state off;
      state idle;
      state running;

      transition off accept start then idle;
      transition idle accept accelerate then running;
      transition running accept stop then off;
    }
  }

  part def Transmission {
    attribute gearCount : Integer;
    attribute currentGear : Integer;

    port driveIn : DrivePort;
    port axleOut : AxlePort;
  }

  part def Wheel {
    attribute diameter : Real;
    attribute pressure : Real;
  }

  port def FuelPort {
    attribute flowRate : Real;
  }

  port def DrivePort {
    attribute torque : Real;
    attribute rpm : Real;
  }

  port def AxlePort;

  requirement def SafetyRequirement {
    doc /* All vehicles must meet safety standards */
  }

  requirement def PerformanceRequirement {
    doc /* Vehicle must achieve target performance */
  }

  action def StartVehicle {
    in key : Key;
    out status : Status;
  }

  action def StopVehicle;

  connect vehicle.engine.driveOut to vehicle.transmission.driveIn;
}
`;

// A slightly different model for comparison testing
const VEHICLE_MODEL_MODIFIED = `
package VehicleModel {
  import ScalarValues::*;

  part def Vehicle {
    attribute mass : Real;

    part engine : Engine;
    part transmission : Transmission;
  }

  part def Engine {
    attribute power : Real;
  }

  part def Transmission {
    attribute gearCount : Integer;
  }
}
`;

// Invalid SysML for error detection
const INVALID_MODEL = `
package BrokenModel {
  part def Engine {
    attribute power : Real;
  // Missing closing brace

  import InvalidSyntax
}
`;

describe("SysML Validators Integration", () => {
  describe("Full Pipeline Test", () => {
    test("syntax validation on valid model", () => {
      const result = validateSysmlSyntax(VEHICLE_MODEL);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);

      // Check element counts
      expect(result.elements.packages).toBe(1);
      expect(result.elements.partDefs).toBeGreaterThan(0);
      expect(result.elements.portDefs).toBeGreaterThan(0);
      expect(result.elements.states).toBeGreaterThan(0);
      expect(result.elements.requirements).toBeGreaterThan(0);
      expect(result.elements.actions).toBeGreaterThan(0);

    });

    test("syntax validation detects errors", () => {
      const result = validateSysmlSyntax(INVALID_MODEL);

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);

    });

    test("component extraction", () => {
      const extracted = extractSysmlComponents(VEHICLE_MODEL);

      expect(extracted.packages.length).toBeGreaterThan(0);
      expect(extracted.partDefs.length).toBeGreaterThan(0);
      expect(extracted.portDefs.length).toBeGreaterThan(0);
      expect(extracted.requirements.length).toBeGreaterThan(0);
      expect(extracted.states.length).toBeGreaterThan(0);
      expect(extracted.actions.length).toBeGreaterThan(0);

    });

    test("component comparison", () => {
      const expected = extractSysmlComponents(VEHICLE_MODEL);
      const actual = extractSysmlComponents(VEHICLE_MODEL_MODIFIED);

      const comparison = compareExtracted(expected, actual);

      expect(comparison.matchRatio).toBeLessThan(1);
      expect(comparison.missing.length).toBeGreaterThan(0);

    });

    test("structure tree building", () => {
      const tree = buildStructureTree(VEHICLE_MODEL);

      expect(tree.name).toBe("root");
      expect(tree.children.length).toBeGreaterThan(0);

      const vehicleModelPkg = tree.children.find((c) => c.name === "VehicleModel");
      expect(vehicleModelPkg).toBeDefined();
      expect(vehicleModelPkg!.children.length).toBeGreaterThan(0);

    });

    test("structure comparison", () => {
      const result = compareStructures(VEHICLE_MODEL, VEHICLE_MODEL_MODIFIED);

      expect(result.match).toBe(false);
      expect(result.missing.length).toBeGreaterThan(0);

    });
  });

  describe("Evaluation Strategy Integration", () => {
    const strategy = createSysmlValidationStrategy();

    test("evaluates valid SysML with syntax check", async () => {
      const task: Task = {
        id: "test-syntax",
        type: "generation",
        name: "Test Syntax Validation",
        description: "Test",
        prompt: "Generate a SysML model",
        evaluation: {
          type: "sysml-validation",
          weight: 1.0,
          checkSyntax: true,
          checkStructure: false,
          checkElements: false,
        },
      };

      const result = await strategy.evaluate(VEHICLE_MODEL, task);

      expect(result.score).toBe(1);
      expect(result.explanation).toContain("100%");

    });

    test("evaluates with structure comparison", async () => {
      const task: Task = {
        id: "test-structure",
        type: "generation",
        name: "Test Structure Validation",
        description: "Test",
        prompt: "Generate a SysML model",
        evaluation: {
          type: "sysml-validation",
          weight: 1.0,
          checkSyntax: true,
          checkStructure: true,
          expectedModel: VEHICLE_MODEL,
          syntaxWeight: 1,
          structureWeight: 2,
        },
      };

      // Test with exact match
      const exactResult = await strategy.evaluate(VEHICLE_MODEL, task);
      expect(exactResult.score).toBe(1);

      // Test with partial match
      const partialResult = await strategy.evaluate(VEHICLE_MODEL_MODIFIED, task);
      expect(partialResult.score).toBeLessThan(1);
      expect(partialResult.score).toBeGreaterThan(0);

    });

    test("evaluates invalid SysML", async () => {
      const task: Task = {
        id: "test-invalid",
        type: "generation",
        name: "Test Invalid Detection",
        description: "Test",
        prompt: "Generate a SysML model",
        evaluation: {
          type: "sysml-validation",
          weight: 1.0,
          checkSyntax: true,
        },
      };

      const result = await strategy.evaluate(INVALID_MODEL, task);

      expect(result.score).toBe(0);

    });
  });

  describe("Summary", () => {
    test("print summary", () => {
    });
  });
});
