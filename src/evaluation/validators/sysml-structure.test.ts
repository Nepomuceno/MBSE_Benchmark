import { describe, test, expect } from "bun:test";
import {
  buildStructureTree,
  compareTrees,
  compareStructures,
  type StructureNode,
} from "./sysml-structure.js";

describe("SysML v2 Structure Matcher", () => {
  describe("buildStructureTree", () => {
    test("builds tree from simple package", () => {
      const model = `
        package Vehicle {
          part def Engine;
          part def Wheel;
        }
      `;
      const tree = buildStructureTree(model);

      expect(tree.name).toBe("root");
      expect(tree.children).toHaveLength(1);
      expect(tree.children[0]!.name).toBe("Vehicle");
      expect(tree.children[0]!.type).toBe("package");
      expect(tree.children[0]!.children).toHaveLength(2);
    });

    test("builds tree with nested structures", () => {
      const model = `
        package VehicleModel {
          part def Vehicle {
            part engine : Engine;
            part transmission : Transmission;
          }
          part def Engine {
            attribute power : Real;
          }
        }
      `;
      const tree = buildStructureTree(model);

      expect(tree.children[0]!.name).toBe("VehicleModel");
      expect(tree.children[0]!.children).toHaveLength(2);

      const vehicleDef = tree.children[0]!.children.find((c) => c.name === "Vehicle");
      expect(vehicleDef).toBeDefined();
      expect(vehicleDef!.children).toHaveLength(2);
    });

    test("handles port definitions", () => {
      const model = `
        package System {
          port def DataPort;
          port def PowerPort {
            attribute voltage : Real;
          }
        }
      `;
      const tree = buildStructureTree(model);
      const pkg = tree.children[0]!;

      expect(pkg.children).toHaveLength(2);
      expect(pkg.children[0]!.type).toBe("port-def");
      expect(pkg.children[1]!.type).toBe("port-def");
      expect(pkg.children[1]!.children).toHaveLength(1);
    });

    test("handles state machines", () => {
      const model = `
        package System {
          state def OperatingState {
            state idle;
            state running;
            state stopped;
          }
        }
      `;
      const tree = buildStructureTree(model);
      const stateDef = tree.children[0]!.children[0]!;

      expect(stateDef.type).toBe("state-def");
      expect(stateDef.name).toBe("OperatingState");
      expect(stateDef.children).toHaveLength(3);
    });

    test("handles requirements", () => {
      const model = `
        package Requirements {
          requirement def SafetyRequirement;
          requirement def <'REQ-001'> PerformanceReq;
        }
      `;
      const tree = buildStructureTree(model);
      const pkg = tree.children[0]!;

      expect(pkg.children).toHaveLength(2);
      expect(pkg.children[0]!.type).toBe("requirement-def");
      expect(pkg.children[1]!.type).toBe("requirement-def");
    });

    test("handles actions", () => {
      const model = `
        package Actions {
          action def StartEngine;
          action def StopEngine {
            attribute timeout : Real;
          }
        }
      `;
      const tree = buildStructureTree(model);
      const pkg = tree.children[0]!;

      expect(pkg.children).toHaveLength(2);
      expect(pkg.children[0]!.type).toBe("action-def");
      expect(pkg.children[1]!.type).toBe("action-def");
    });

    test("ignores comments", () => {
      const model = `
        package Vehicle {
          // This is a comment
          part def Engine;
          /* Block comment
           * with part def Fake;
           */
          part def Wheel;
        }
      `;
      const tree = buildStructureTree(model);
      const pkg = tree.children[0]!;

      expect(pkg.children).toHaveLength(2);
      expect(pkg.children.map((c) => c.name)).toEqual(["Engine", "Wheel"]);
    });
  });

  describe("compareTrees", () => {
    test("returns match for identical trees", () => {
      const tree: StructureNode = {
        name: "root",
        type: "package",
        children: [
          {
            name: "Vehicle",
            type: "package",
            children: [
              { name: "Engine", type: "part-def", children: [] },
              { name: "Wheel", type: "part-def", children: [] },
            ],
          },
        ],
      };

      const result = compareTrees(tree, tree);

      expect(result.match).toBe(true);
      expect(result.score).toBe(1);
      expect(result.missing).toHaveLength(0);
      expect(result.extra).toHaveLength(0);
      expect(result.misplaced).toHaveLength(0);
    });

    test("identifies missing nodes", () => {
      const expected: StructureNode = {
        name: "root",
        type: "package",
        children: [
          {
            name: "Vehicle",
            type: "package",
            children: [
              { name: "Engine", type: "part-def", children: [] },
              { name: "Wheel", type: "part-def", children: [] },
            ],
          },
        ],
      };

      const actual: StructureNode = {
        name: "root",
        type: "package",
        children: [
          {
            name: "Vehicle",
            type: "package",
            children: [{ name: "Engine", type: "part-def", children: [] }],
          },
        ],
      };

      const result = compareTrees(expected, actual);

      expect(result.match).toBe(false);
      expect(result.missing).toHaveLength(1);
      expect(result.missing[0]!.name).toBe("Wheel");
    });

    test("identifies extra nodes", () => {
      const expected: StructureNode = {
        name: "root",
        type: "package",
        children: [
          {
            name: "Vehicle",
            type: "package",
            children: [{ name: "Engine", type: "part-def", children: [] }],
          },
        ],
      };

      const actual: StructureNode = {
        name: "root",
        type: "package",
        children: [
          {
            name: "Vehicle",
            type: "package",
            children: [
              { name: "Engine", type: "part-def", children: [] },
              { name: "Transmission", type: "part-def", children: [] },
            ],
          },
        ],
      };

      const result = compareTrees(expected, actual);

      expect(result.match).toBe(false);
      expect(result.extra).toHaveLength(1);
      expect(result.extra[0]!.name).toBe("Transmission");
    });

    test("identifies misplaced nodes", () => {
      const expected: StructureNode = {
        name: "root",
        type: "package",
        children: [
          {
            name: "Vehicle",
            type: "package",
            children: [
              {
                name: "Powertrain",
                type: "package",
                children: [{ name: "Engine", type: "part-def", children: [] }],
              },
            ],
          },
        ],
      };

      const actual: StructureNode = {
        name: "root",
        type: "package",
        children: [
          {
            name: "Vehicle",
            type: "package",
            children: [
              { name: "Powertrain", type: "package", children: [] },
              { name: "Engine", type: "part-def", children: [] },
            ],
          },
        ],
      };

      const result = compareTrees(expected, actual);

      expect(result.match).toBe(false);
      expect(result.misplaced).toHaveLength(1);
      expect(result.misplaced[0]!.name).toBe("Engine");
      expect(result.misplaced[0]!.expectedPath).toBe("Vehicle/Powertrain/Engine");
      expect(result.misplaced[0]!.actualPath).toBe("Vehicle/Engine");
    });

    test("calculates correct score", () => {
      const expected: StructureNode = {
        name: "root",
        type: "package",
        children: [
          {
            name: "Pkg",
            type: "package",
            children: [
              { name: "A", type: "part-def", children: [] },
              { name: "B", type: "part-def", children: [] },
              { name: "C", type: "part-def", children: [] },
              { name: "D", type: "part-def", children: [] },
            ],
          },
        ],
      };

      const actual: StructureNode = {
        name: "root",
        type: "package",
        children: [
          {
            name: "Pkg",
            type: "package",
            children: [
              { name: "A", type: "part-def", children: [] },
              { name: "B", type: "part-def", children: [] },
            ],
          },
        ],
      };

      const result = compareTrees(expected, actual);

      // 5 expected nodes (Pkg, A, B, C, D), 3 matched (Pkg, A, B)
      expect(result.score).toBe(3 / 5);
    });
  });

  describe("compareStructures", () => {
    test("compares two model strings", () => {
      const expected = `
        package Vehicle {
          part def Engine;
          part def Wheel;
        }
      `;

      const actual = `
        package Vehicle {
          part def Engine;
          part def Wheel;
        }
      `;

      const result = compareStructures(expected, actual);

      expect(result.match).toBe(true);
      expect(result.score).toBe(1);
    });

    test("detects differences in model strings", () => {
      const expected = `
        package Vehicle {
          part def Engine;
          part def Wheel;
          part def Body;
        }
      `;

      const actual = `
        package Vehicle {
          part def Engine;
          part def Transmission;
        }
      `;

      const result = compareStructures(expected, actual);

      expect(result.match).toBe(false);
      expect(result.missing.map((n) => n.name)).toContain("Wheel");
      expect(result.missing.map((n) => n.name)).toContain("Body");
      expect(result.extra.map((n) => n.name)).toContain("Transmission");
    });

    test("handles complex nested structures", () => {
      const expected = `
        package VehicleModel {
          part def Vehicle {
            part engine : Engine;
            port fuelIn : FuelPort;
          }
          part def Engine {
            attribute power : Real;
          }
          port def FuelPort;
        }
      `;

      const actual = `
        package VehicleModel {
          part def Vehicle {
            part engine : Engine;
            port fuelIn : FuelPort;
          }
          part def Engine {
            attribute power : Real;
          }
          port def FuelPort;
        }
      `;

      const result = compareStructures(expected, actual);

      expect(result.match).toBe(true);
    });
  });
});
