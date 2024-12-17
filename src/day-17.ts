const example1: string = "data/example-17a.txt";
const example2: string = "data/example-17b.txt";
const input: string = "data/input-17.txt";

import fs from "fs";

// HACK: 64 bit XOR for JavaScript
// https://stackoverflow.com/a/78034728/409744
const xor64 = (a: number, b: number): number => {
  const hi = 0x80000000;
  const low = 0x7fffffff;
  const hia = ~~(a / hi);
  const hib = ~~(b / hi);
  const lowa = a & low;
  const lowb = b & low;
  const h = hia ^ hib;
  const l = lowa ^ lowb;
  return h * hi + l;
};

// HACK: 64 bit MOD for JavaScript
const mod64 = (a: number, b: number): number => {
  const as = a.toString();
  let tmp = "";
  for (let i = 0; i < as.length; i++) {
    tmp += as[i];
    tmp = (parseInt(tmp) % b).toString(10);
  }
  return parseInt(tmp);
};

enum OpCode {
  ADV = 0,
  BXL = 1,
  BST = 2,
  JNZ = 3,
  BXC = 4,
  OUT = 5,
  BDV = 6,
  CDV = 7,
}

class Computer {
  program: number[];
  ip: number;

  reg_a: number = 0;
  reg_b: number = 0;
  reg_c: number = 0;

  out: number[] = [];

  constructor(file: string) {
    for (const line of fs
      .readFileSync(file, "utf-8")
      .split(/\r?\n/)
      .filter((line) => line.length > 0)) {
      const parts = line.split(": ");
      switch (parts[0]) {
        case "Register A":
          this.reg_a = parseInt(parts[1]);
          break;
        case "Register B":
          this.reg_b = parseInt(parts[1]);
          break;
        case "Register C":
          this.reg_c = parseInt(parts[1]);
          break;
        case "Program":
          this.program = parts[1].split(",").map((x) => parseInt(x));
          break;
      }
    }
  }

  read_op(): OpCode {
    return this.program[this.ip] as OpCode;
  }

  read_combo(): number {
    const n = this.program[this.ip + 1];
    switch (n) {
      case 0:
      case 1:
      case 2:
      case 3:
        return n;
      case 4:
        return this.reg_a;
      case 5:
        return this.reg_b;
      case 6:
        return this.reg_c;
      default:
        throw new Error("Invalid combo");
    }
  }

  read_literal(): number {
    return this.program[this.ip + 1];
  }

  instructions = {
    [OpCode.ADV]: (): void => {
      this.reg_a = Math.floor(this.reg_a / Math.pow(2, this.read_combo()));
      this.ip += 2;
    },
    [OpCode.BXL]: (): void => {
      this.reg_b = xor64(this.reg_b, this.read_literal());
      this.ip += 2;
    },
    [OpCode.BST]: (): void => {
      this.reg_b = mod64(this.read_combo(), 8);
      this.ip += 2;
    },
    [OpCode.JNZ]: (): void => {
      const target = this.read_literal();
      if (this.reg_a !== 0) {
        this.ip = target;
      } else {
        this.ip += 2;
      }
    },
    [OpCode.BXC]: (): void => {
      this.read_literal();
      this.reg_b = xor64(this.reg_b, this.reg_c);
      this.ip += 2;
    },
    [OpCode.OUT]: (): void => {
      this.out.push(mod64(this.read_combo(), 8));
      this.ip += 2;
    },
    [OpCode.BDV]: (): void => {
      this.reg_b = Math.floor(this.reg_a / Math.pow(2, this.read_combo()));
      this.ip += 2;
    },
    [OpCode.CDV]: (): void => {
      this.reg_c = Math.floor(this.reg_a / Math.pow(2, this.read_combo()));
      this.ip += 2;
    },
  };

  run(): number[] {
    this.ip = 0;
    this.out.length = 0;
    while (this.ip < this.program.length) {
      const op = this.read_op();
      this.instructions[op]();
    }
    return this.out;
  }
}

const solve_1 = (file: string): string => {
  return new Computer(file).run().join(",");
};

const solve_2 = (file: string): number => {
  const c = new Computer(file);
  const p = c.program;

  // - A is only ever modified by ADV
  // - For the program to end, A must be 0
  // - A is right shift by 3 bits per iteration
  // - This means the starting state of an iteration is only determined by the last <shift> bits of A
  // - Therefore we can brute force the starting state of A to get the last output digit
  // - Unshift/leftshift, then get the next digit, etc.

  const stack: number[] = [0];

  while (stack.length > 0) {
    let a = stack.pop() ?? 0;

    // Left shift A (avoid bit operands)
    a *= 8;

    // Try all possible remainders getting lost in the original right shift
    // Highest first, to check lowest first next iteration
    for (let ta = 7; ta >= 0; ta--) {
      const start = a + ta;
      c.reg_a = start;

      const res = c.run();

      // If the output is longer than the program, it's definitely invalid
      if (res.length > p.length) {
        continue;
      }

      let valid = true;
      const o = p.length - res.length;
      for (let i = 0; i < res.length; i++) {
        if (res[i] !== p[o + i]) {
          valid = false;
          break;
        }
      }
      if (!valid) {
        continue;
      }

      // Found a valid starting state that's the right length
      if (res.length === p.length) {
        return start;
      }

      // Prevent infinite loop as 0 may only be the initial state
      if (start === 0) {
        continue;
      }

      // Valid, but not long enough, so continue with this value
      stack.push(start);
    }
  }

  return 0;
};

export const main = (): void => {
  console.log("Example 1:", solve_1(example1));
  console.log("Solution 1:", solve_1(input));
  console.log("Example 2:", solve_2(example2));
  console.log("Solution 2:", solve_2(input));
};
