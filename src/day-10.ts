const example1: string = "data/example-10a.txt";
const example2: string = "data/example-10b.txt";
const example3: string = "data/example-10c.txt";
const input: string = "data/input-10.txt";

import fs from "fs";

class TopoMap {
  map: string[] = [];
  width: number;
  height: number;

  constructor(file: string) {
    for (const line of fs
      .readFileSync(file, "utf-8")
      .split(/\r?\n/)
      .filter((l) => l.length)) {
      this.map.push(line);
    }
    this.width = this.map[0].length;
    this.height = this.map.length;
  }

  getTrailRouteCount(x: number, y: number): number {
    const height = parseInt(this.map[y][x]);
    if (height === 9) return 1;

    let res = 0;
    if (x > 0 && parseInt(this.map[y][x - 1]) == height + 1) {
      res += this.getTrailRouteCount(x - 1, y);
    }
    if (x < this.width - 1 && parseInt(this.map[y][x + 1]) == height + 1) {
      res += this.getTrailRouteCount(x + 1, y);
    }
    if (y > 0 && parseInt(this.map[y - 1][x]) == height + 1) {
      res += this.getTrailRouteCount(x, y - 1);
    }
    if (y < this.height - 1 && parseInt(this.map[y + 1][x]) == height + 1) {
      res += this.getTrailRouteCount(x, y + 1);
    }
    return res;
  }

  getTrailHeadCount(x: number, y: number): Set<string> {
    const res: Set<string> = new Set();
    const height = parseInt(this.map[y][x]);
    if (height === 9) {
      res.add(`${x},${y}`);
      return res;
    }

    if (x > 0 && parseInt(this.map[y][x - 1]) == height + 1) {
      for (const head of this.getTrailHeadCount(x - 1, y)) {
        res.add(head);
      }
    }
    if (x < this.width - 1 && parseInt(this.map[y][x + 1]) == height + 1) {
      for (const head of this.getTrailHeadCount(x + 1, y)) {
        res.add(head);
      }
    }
    if (y > 0 && parseInt(this.map[y - 1][x]) == height + 1) {
      for (const head of this.getTrailHeadCount(x, y - 1)) {
        res.add(head);
      }
    }
    if (y < this.height - 1 && parseInt(this.map[y + 1][x]) == height + 1) {
      for (const head of this.getTrailHeadCount(x, y + 1)) {
        res.add(head);
      }
    }
    return res;
  }

  getTrailRouteCountTotal(): number[] {
    const res: number[] = [];
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        if (this.map[y][x] === "0") {
          res.push(this.getTrailRouteCount(x, y));
        }
      }
    }
    return res;
  }

  getTrailHeadCountTotal(): number[] {
    const res: number[] = [];
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        if (this.map[y][x] === "0") {
          res.push(this.getTrailHeadCount(x, y).size);
        }
      }
    }
    return res;
  }
}

const solve_1 = (file: string): number => {
  return new TopoMap(file).getTrailHeadCountTotal().reduce((a, b) => a + b, 0);
};

const solve_2 = (file: string): number => {
  return new TopoMap(file).getTrailRouteCountTotal().reduce((a, b) => a + b, 0);
};

export const main = (): void => {
  console.log("Example 1a:", solve_1(example1));
  console.log("Example 1b:", solve_1(example2));
  console.log("Solution 1:", solve_1(input));
  console.log("Example 2a:", solve_2(example3));
  console.log("Example 2b:", solve_2(example2));
  console.log("Solution 2:", solve_2(input));
};
