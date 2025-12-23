/**
 * SysML v2 Semantic Comparator Tests
 *
 * Tests for semantic comparison of SysML v2 models.
 */

import { describe, test, expect } from "bun:test";
import {
  compareSemanticsSync,
} from "./sysml-semantic.js";

// Sample models for testing

const VEHICLE_MODEL_A = `
package VehicleModel {
  import ScalarValues::*;

  part def Vehicle {
    attribute mass : Real;
    attribute maxSpeed : Real;

    part engine : Engine;
    part transmission : Transmission;
  }

  part def Engine {
    attribute power : Real;
    attribute displacement : Real;
  }

  part def Transmission {
    attribute gearCount : Integer;
  }
}
`;

// Semantically equivalent but formatted differently
const VEHICLE_MODEL_A_REFORMATTED = `
package VehicleModel {
    import ScalarValues::*;

    // Vehicle definition
    part def Vehicle {
        attribute mass : Real;
        attribute maxSpeed : Real;
        part engine : Engine;
        part transmission : Transmission;
    }

    /* Engine component */
    part def Engine {
        attribute power : Real;
        attribute displacement : Real;
    }

    part def Transmission {
        attribute gearCount : Integer;
    }
}
`;

// Semantically different - missing parts
const VEHICLE_MODEL_PARTIAL = `
package VehicleModel {
  import ScalarValues::*;

  part def Vehicle {
    attribute mass : Real;
    part engine : Engine;
  }

  part def Engine {
    attribute power : Real;
  }
}
`;

// Completely different model
const DRONE_MODEL = `
package DroneModel {
  part def Drone {
    attribute weight : Real;
    part motor : Motor[4];
    part controller : FlightController;
  }

  part def Motor {
    attribute rpm : Real;
  }

  part def FlightController {
    attribute mode : String;
  }
}
`;

// Model with state machines
const STATE_MODEL = `
package StateExample {
  state def EngineState {
    state off;
    state idle;
    state running;

    transition off accept start then idle;
    transition idle accept accelerate then running;
    transition running accept stop then off;
  }
}
`;

// Similar state model with same semantics
const STATE_MODEL_EQUIVALENT = `
package StateExample {
  // Engine state machine
  state def EngineState {
    state off;
    state idle;
    state running;
    transition off accept start then idle;
    transition idle accept accelerate then running;
    transition running accept stop then off;
  }
}
`;

// State model with different states
const STATE_MODEL_DIFFERENT = `
package StateExample {
  state def EngineState {
    state off;
    state on;

    transition off accept start then on;
    transition on accept stop then off;
  }
}
`;

describe("SysML v2 Semantic Comparator", () => {
  describe("compareSemanticsSync", () => {
    describe("identical models", () => {
      test("returns equivalent for identical models", () => {
        const result = compareSemanticsSync(VEHICLE_MODEL_A, VEHICLE_MODEL_A);

        expect(result.equivalent).toBe(true);
        expect(result.confidence).toBe(1.0);
        expect(result.differences).toHaveLength(0);
      });

      test("returns equivalent for reformatted models", () => {
        const result = compareSemanticsSync(VEHICLE_MODEL_A, VEHICLE_MODEL_A_REFORMATTED);

        expect(result.equivalent).toBe(true);
        expect(result.confidence).toBeGreaterThan(0.9);
        expect(result.differences.filter((d) => d.significance === "major")).toHaveLength(0);
      });
    });

    describe("partial models", () => {
      test("identifies missing elements", () => {
        const result = compareSemanticsSync(VEHICLE_MODEL_A, VEHICLE_MODEL_PARTIAL);

        expect(result.differences.length).toBeGreaterThan(0);

        // Should find missing Transmission part def
        const missingTransmission = result.differences.find(
          (d) => d.element.includes("Transmission") && d.actual === "missing"
        );
        expect(missingTransmission).toBeDefined();
      });

      test("lowers confidence for missing elements", () => {
        const result = compareSemanticsSync(VEHICLE_MODEL_A, VEHICLE_MODEL_PARTIAL);

        expect(result.confidence).toBeLessThan(1.0);
      });
    });

    describe("different models", () => {
      test("returns not equivalent for completely different models", () => {
        const result = compareSemanticsSync(VEHICLE_MODEL_A, DRONE_MODEL);

        expect(result.equivalent).toBe(false);
        expect(result.differences.length).toBeGreaterThan(0);
      });

      test("identifies major differences", () => {
        const result = compareSemanticsSync(VEHICLE_MODEL_A, DRONE_MODEL);

        const majorDifferences = result.differences.filter((d) => d.significance === "major");
        expect(majorDifferences.length).toBeGreaterThan(0);
      });
    });

    describe("state machines", () => {
      test("returns equivalent for same state machine with different formatting", () => {
        const result = compareSemanticsSync(STATE_MODEL, STATE_MODEL_EQUIVALENT);

        expect(result.equivalent).toBe(true);
        expect(result.confidence).toBeGreaterThan(0.9);
      });

      test("identifies differences in state definitions", () => {
        const result = compareSemanticsSync(STATE_MODEL, STATE_MODEL_DIFFERENT);

        expect(result.equivalent).toBe(false);
      });
    });

    describe("empty models", () => {
      test("handles empty expected model", () => {
        const result = compareSemanticsSync("", VEHICLE_MODEL_A);

        expect(result.equivalent).toBe(false);
        expect(result.differences.length).toBeGreaterThan(0);
      });

      test("handles empty actual model", () => {
        const result = compareSemanticsSync(VEHICLE_MODEL_A, "");

        expect(result.equivalent).toBe(false);
        expect(result.differences.filter((d) => d.significance === "major").length).toBeGreaterThan(
          0
        );
      });

      test("handles both empty models", () => {
        const result = compareSemanticsSync("", "");

        expect(result.equivalent).toBe(true);
        expect(result.confidence).toBe(1.0);
      });
    });

    describe("normalization", () => {
      test("ignores comments", () => {
        const modelWithComments = `
          package Test {
            /* block comment */
            part def A {} // line comment
          }
        `;
        const modelWithoutComments = `
          package Test {
            part def A {}
          }
        `;

        const result = compareSemanticsSync(modelWithComments, modelWithoutComments);

        expect(result.equivalent).toBe(true);
      });

      test("ignores whitespace differences", () => {
        const compact = `package Test{part def A{}}`;
        const spacious = `
          package Test {
            part def A {
            }
          }
        `;

        const result = compareSemanticsSync(compact, spacious);

        expect(result.equivalent).toBe(true);
      });
    });

    describe("result structure", () => {
      test("returns valid SemanticComparisonResult structure", () => {
        const result = compareSemanticsSync(VEHICLE_MODEL_A, VEHICLE_MODEL_PARTIAL);

        expect(typeof result.equivalent).toBe("boolean");
        expect(typeof result.confidence).toBe("number");
        expect(Array.isArray(result.differences)).toBe(true);
        expect(typeof result.explanation).toBe("string");

        expect(result.confidence).toBeGreaterThanOrEqual(0);
        expect(result.confidence).toBeLessThanOrEqual(1);
      });

      test("differences have valid significance levels", () => {
        const result = compareSemanticsSync(VEHICLE_MODEL_A, DRONE_MODEL);

        for (const diff of result.differences) {
          expect(["major", "minor", "cosmetic"]).toContain(diff.significance);
        }
      });
    });
  });

  describe("SemanticDifference type", () => {
    test("major differences indicate missing key elements", () => {
      const result = compareSemanticsSync(VEHICLE_MODEL_A, "package Empty {}");

      const majorDiffs = result.differences.filter((d) => d.significance === "major");
      expect(majorDiffs.length).toBeGreaterThan(0);
      expect(majorDiffs.every((d) => d.actual === "missing")).toBe(true);
    });

    test("minor differences indicate extra elements", () => {
      const result = compareSemanticsSync(
        "package Test { part def A {} }",
        "package Test { part def A {} part def B {} }"
      );

      const minorDiffs = result.differences.filter((d) => d.significance === "minor");
      expect(minorDiffs.some((d) => d.actual === "present")).toBe(true);
    });
  });
});
