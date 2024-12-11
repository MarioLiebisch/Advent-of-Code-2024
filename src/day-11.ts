const example1: string = "data/example-11a.txt";
const example2: string = "data/example-11b.txt";
const input: string = "data/input-11.txt";

import fs from "fs";

const count_memory: { [stone: number]: { [blinks: number]: number } } = {};

class Stones extends Array<number> {
  constructor(...args: number[]) {
    super();
    this.push(...args);
  }

  blink(): void {
    const old = [...this];
    this.length = 0;
    for (const stone of old) {
      if (stone === 0) {
        this.push(1);
        continue;
      }
      const str = stone.toString();
      if (str.length % 2 == 0) {
        const h = str.length / 2;
        this.push(parseInt(str.substring(0, h)));
        this.push(parseInt(str.substring(h)));
        continue;
      }
      this.push(stone * 2024);
    }
  }

  blink_rec_count(blinks: number = 75): number {
    if (blinks === 0) {
      return this.length;
    }
    const old = [...this];
    this.length = 0;
    for (const stone of old) {
      if (stone === 0) {
        this.push(1);
        continue;
      }
      const str = stone.toString();
      if (str.length % 2 == 0) {
        const h = str.length / 2;
        this.push(parseInt(str.substring(0, h)));
        this.push(parseInt(str.substring(h)));
        continue;
      }
      this.push(stone * 2024);
    }

    let res = 0;
    const counts: { [stone: number]: number } = {};
    for (const stone of this) {
      counts[stone] = (counts[stone] ?? 0) + 1;
    }
    for (const stone of Object.keys(counts)) {
      const sub = new Stones(parseInt(stone));
      const m = count_memory[stone] ? count_memory[stone][blinks - 1] : 0;
      if (m) {
        res += counts[stone] * m;
        continue;
      }
      if (!count_memory[stone]) {
        count_memory[stone] = {};
      }
      count_memory[stone][blinks - 1] = sub.blink_rec_count(blinks - 1);
      res += counts[stone] * count_memory[stone][blinks - 1];
    }
    return res;
  }
}

const solve_1 = (file: string, blinks: number = 25): number => {
  const stones: Stones = new Stones(
    ...fs
      .readFileSync(file, "utf-8")
      .trim()
      .split(/\s+/)
      .map((n) => parseInt(n)),
  );

  for (let i = 0; i < blinks; i++) {
    stones.blink();
  }

  return stones.length;
};

const solve_2 = (file: string, blinks: number = 75): number => {
  const stones: Stones = new Stones(
    ...fs
      .readFileSync(file, "utf-8")
      .trim()
      .split(/\s+/)
      .map((n) => parseInt(n)),
  );

  return stones.blink_rec_count(blinks);
};

export const main = (): void => {
  console.log("Example 1a:", solve_1(example1, 1));
  console.log("Example 1b:", solve_1(example2));
  console.log("Solution 1:", solve_1(input));
  console.log("Solution 2:", solve_2(input));
};
