const example: string = "data/example-07.txt";
const input: string = "data/input-07.txt";

import fs from "fs";

class Equation {
  solution: number = 0;
  operands: number[] = [];
  constructor(solution: number, operands: number[]) {
    this.solution = solution;
    this.operands = operands;
  }
  solve(operators: string = "+*", offset: number = 0): number[] {
    const length = this.operands.length;

    // Out of bounds
    if (offset >= length) {
      return [];
    }
    const current = this.operands[offset];
    // Last element
    if (offset === length - 1) {
      return [current];
    }
    const next = this.solve(operators, offset + 1);
    const ret: number[] = [];
    for (const op of operators) {
      switch (op) {
        case "+": {
          ret.push(
            ...next.map((n) => current + n).filter((n) => n <= this.solution),
          );
          break;
        }
        case "*":
          ret.push(
            ...next.map((n) => current * n).filter((n) => n <= this.solution),
          );
          break;
        case "|":
          ret.push(
            ...next
              .map((n) => parseInt("" + n + current))
              .filter((n) => n <= this.solution),
          );
          break;
      }
    }
    return ret;
  }
}

const solve_1 = (file: string): number => {
  let res = 0;
  for (const line of fs
    .readFileSync(file, "utf-8")
    .split(/\r?\n/)
    .filter((line) => line.length > 0)) {
    const [sum, operands] = line.split(": ");
    const eq = new Equation(
      parseInt(sum),
      operands
        .split(" ")
        .filter((e) => e.length >= 0)
        .map((e) => parseInt(e))
        // Reverse as our recursion parses right to left
        .reverse(),
    );
    const ret = eq.solve();
    if (ret.includes(eq.solution)) {
      res += eq.solution;
    }
  }
  return res;
};

const solve_2 = (file: string): number => {
  let res = 0;
  for (const line of fs
    .readFileSync(file, "utf-8")
    .split(/\r?\n/)
    .filter((line) => line.length > 0)) {
    const [sum, operands] = line.split(": ");
    const eq = new Equation(
      parseInt(sum),
      operands
        .split(" ")
        .filter((e) => e.length >= 0)
        .map((e) => parseInt(e))
        // Reverse as our recursion parses right to left
        .reverse(),
    );
    const ret = eq.solve("+*|");
    if (ret.includes(eq.solution)) {
      res += eq.solution;
    }
  }
  return res;
};

export const main = (): void => {
  console.log("Example 1:", solve_1(example));
  console.log("Solution 1:", solve_1(input));
  console.log("Example 2:", solve_2(example));
  console.log("Solution 2:", solve_2(input));
};
