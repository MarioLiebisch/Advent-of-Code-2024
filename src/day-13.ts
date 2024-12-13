const example: string = "data/example-13.txt";
const input: string = "data/input-13.txt";

import fs from "fs";

class ClawMachine {
  a: { x: number; y: number };
  b: { x: number; y: number };
  p: { x: number; y: number };

  constructor() {
    this.a = { x: 0, y: 0 };
    this.b = { x: 0, y: 0 };
    this.p = { x: 0, y: 0 };
  }

  get cheapest_move(): number[] {
    // Get the determinant
    const det = this.a.x * this.b.y - this.a.y * this.b.x;

    if (det === 0) {
      // Shouldn't happen, but whatever
      return [0, 0, 0];
    }

    // Calculate two factors
    const f1 = (this.p.x * this.b.y - this.p.y * this.b.x) / det;
    const f2 = (this.a.x * this.p.y - this.a.y * this.p.x) / det;

    // Avoid any negative or non-integer factors
    if (f1 < 0 || f2 < 0 || f1 !== Math.floor(f1) || f2 !== Math.floor(f2)) {
      return [0, 0, 0];
    }

    return [f1 * 3 + f2, f1, f2];
  }

  // Works great for part 1, but is way too slow for part 2
  get cheapest_move_org(): number[] {
    let cheapest = [Number.MAX_SAFE_INTEGER, 0, 0];

    const b1max = Math.min(
      Math.floor(this.p.x / this.a.x),
      Math.floor(this.p.y / this.a.y),
    );

    for (let b1 = b1max; b1 >= 0; --b1) {
      const b1x = this.a.x * b1;
      const b1y = this.a.y * b1;

      const b2xf = (this.p.x - b1x) / this.b.x;
      const b2yf = (this.p.y - b1y) / this.b.y;

      // Can we reach the point with the current b1?
      if (
        b2xf != b2yf ||
        b2xf !== Math.floor(b2xf) ||
        b2yf !== Math.floor(b2yf)
      ) {
        continue;
      }

      const price = b1 * 3 + b2xf;
      if (price < cheapest[0]) {
        cheapest = [price, b1, b2xf];
      }
    }

    if (cheapest[0] === Number.MAX_SAFE_INTEGER) {
      return [0, 0, 0];
    }
    return cheapest;
  }
}

const solve = (file: string, offset: number = 0): number => {
  const machines: ClawMachine[] = [];
  let new_machine = new ClawMachine();
  for (const line of fs.readFileSync(file, "utf-8").split(/\r?\n/)) {
    if (line === "") continue;
    const coords = line.match(/(\w): X[+=](\d+), Y[+=](\d+)/);
    if (!coords) continue; // Impossible, but silences linting
    switch (coords[1]) {
      case "A":
        new_machine.a = {
          x: parseInt(coords[2] ?? ""),
          y: parseInt(coords[3] ?? ""),
        };
        break;
      case "B":
        new_machine.b = {
          x: parseInt(coords[2] ?? ""),
          y: parseInt(coords[3] ?? ""),
        };
        break;
      case "e":
        new_machine.p = {
          x: parseInt(coords[2] ?? "") + offset,
          y: parseInt(coords[3] ?? "") + offset,
        };
        machines.push(new_machine);
        new_machine = new ClawMachine();
        break;
    }
  }
  return machines.reduce((acc, machine) => acc + machine.cheapest_move[0], 0);
};

export const main = (): void => {
  console.log("Example 1:", solve(example));
  console.log("Solution 1:", solve(input));
  console.log("Example 2:", solve(example, 10000000000000));
  console.log("Solution 2:", solve(input, 10000000000000));
};
