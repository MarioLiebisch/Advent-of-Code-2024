const example1: string = "data/example-24a.txt";
const example2: string = "data/example-24b.txt";
const input1: string = "data/input-24.txt";
const input2: string = "data/input-24-fixed.txt";

import fs from "fs";

const solve_1 = (file: string): number => {
  const wires: { [key: string]: boolean } = {};
  const gate_logic: { [key: string]: (a: boolean, b: boolean) => boolean } = {
    AND: (a, b) => a && b,
    OR: (a, b) => a || b,
    XOR: (a, b) => a != b,
  };
  const gates: { a: string; b: string; gate: string; out: string }[] = [];
  let in_wiring = false;
  fs.readFileSync(file, "utf8")
    .split(/\r?\n/)
    .forEach((line) => {
      if (line === "") {
        in_wiring = true;
      } else if (!in_wiring) {
        const [key, value] = line.split(": ");
        wires[key] = value === "1";
      } else {
        const [a, gate, b, , out] = line.split(" ");
        gates.push({ a, b, gate, out });
      }
    });

  let changed = true;
  while (changed) {
    changed = false;
    gates.forEach(({ a, b, gate, out }) => {
      if (wires[out] === undefined) {
        if (wires[a] !== undefined && wires[b] !== undefined) {
          wires[out] = gate_logic[gate](wires[a], wires[b]);
          changed = true;
        }
      }
    });
  }

  let res = 0;
  for (const key of Object.keys(wires)
    .filter((k) => k[0] === "z")
    .sort()
    .reverse()) {
    res = res * 2 + (wires[key] ? 1 : 0);
  }
  return res;
};

interface Gate {
  a: string;
  b: string;
  gate: string;
  out: string;
}

const solve_2 = (file: string): string => {
  const wires_template: { [key: string]: boolean } = {};
  const gate_logic: { [key: string]: (a: boolean, b: boolean) => boolean } = {
    AND: (a, b) => a && b,
    OR: (a, b) => a || b,
    XOR: (a, b) => a != b,
  };
  const gates: Gate[] = [];
  let in_wiring = false;
  fs.readFileSync(file, "utf8")
    .split(/\r?\n/)
    .forEach((line) => {
      if (line === "") {
        in_wiring = true;
      } else if (!in_wiring) {
        const [key, value] = line.split(": ");
        wires_template[key] = value === "1";
      } else {
        const [a, gate, b, , out] = line.split(" ");
        gates.push({ a, b, gate, out });
      }
    });

  const run = (x: number, y: number) => {
    const wires = { ...wires_template };
    const gates = [...gates];

    for (let i = 0; i < 45; i++) {
      wires[`x${i.toString().padStart(2, "0")}`] = x % 2 !== 0;
      wires[`y${i.toString().padStart(2, "0")}`] = y % 2 !== 0;
      x = Math.floor(x / 2);
      y = Math.floor(y / 2);
    }

    let changed = true;
    while (changed) {
      changed = false;
      gates.forEach(({ a, b, gate, out }) => {
        if (wires[out] === undefined) {
          if (wires[a] !== undefined && wires[b] !== undefined) {
            wires[out] = gate_logic[gate](wires[a], wires[b]);
            changed = true;
          }
        }
      });
    }

    let res = 0;
    for (const key of Object.keys(wires)
      .filter((k) => k[0] === "z")
      .sort()
      .reverse()) {
      res = res * 2 + (wires[key] ? 1 : 0);
    }

    return res;
  };

  const patches: string[][] = [
    // ["z20", "fhp"],
    // ["z16", "hmk"],
    // ["z33", "fcd"],
    // ["tpc", "rvf"],
  ];

  for (const gate of gates) {
    for (const patch of patches) {
      if (gate.out == patch[0]) {
        gate.out = patch[1];
        break;
      } else if (gate.out == patch[1]) {
        gate.out = patch[0];
        break;
      }
    }
  }

  // x01 XOR y01 -> rsq
  // x01 AND y01 -> qkj # carry bit from addition
  // bdk XOR rsq -> z01 # output = sum + previous carry bit
  // rsq AND bdk -> jnh # carry bit from previous addition
  // jnh OR qkj -> spt # carry bit for next addition

  const bugged: Set<string> = new Set();
  for (const gate of gates) {
    if (gate.out[0] === "z" && gate.gate !== "XOR") {
      if (gate.out === "z45") continue;
      bugged.add(gate.out);
    }

    // x## XOR y## -> z##
    // Invalid, as carry bit has to be considered
    if (
      gate.gate === "XOR" &&
      !["x", "y", "z"].includes(gate.a[0]) &&
      !["x", "y", "z"].includes(gate.b[0]) &&
      !["x", "y", "z"].includes(gate.out[0])
    ) {
      bugged.add(gate.out);
    }

    // ... AND ... -> X
    // Writing carry bit to X, but
    // X is not used like a carry bit (i.e. in OR)
    if (gate.gate === "AND" && gate.a !== "x00" && gate.b !== "x00") {
      for (const gate2 of gates) {
        if (
          gate2.gate !== "OR" &&
          (gate.out === gate2.a || gate.out === gate2.b)
        ) {
          bugged.add(gate.out);
          break;
        }
      }
    }
    // ... XOR ... -> X
    // Writing sum to X, but
    // X is never used with a carry bit
    if (gate.gate === "XOR") {
      for (const gate2 of gates) {
        if (
          gate2.gate === "OR" &&
          (gate.out === gate2.a || gate.out === gate2.b)
        ) {
          bugged.add(gate.out);
          break;
        }
      }
    }
  }

  const res = Array.from(bugged).sort().join(",");
  return res === "" ? "No bugs found" : res;
};

export const main = (): void => {
  console.log("Example 1a:", solve_1(example1));
  console.log("Example 1b:", solve_1(example2));
  console.log("Solution 1:", solve_1(input1));
  console.log("Solution 2:", solve_2(input2));
};
