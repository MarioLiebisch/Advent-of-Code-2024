const example: string = "data/example-18.txt";
const input: string = "data/input-18.txt";

import fs from "fs";

enum Byte {
  Empty = ".",
  Corrupted = "#",
}

class Vector {
  x: number;
  y: number;
  constructor(x: number = 0, y: number = 0) {
    this.x = x;
    this.y = y;
  }
}

class Grid extends Array<Byte> {
  width: number;
  height: number;
  bytes: number[] = [];
  bytesFallen: number = 0;

  constructor(file: string, width: number = 71, height: number = 71) {
    super(width * height);
    this.width = width;
    this.height = height;
    this.fill(Byte.Empty);
    this.bytes = fs
      .readFileSync(file, "utf-8")
      .split(/\r?\n/)
      .filter((line) => line.length > 0)
      .map((line) => {
        const [x, y] = line.split(",").map((x) => parseInt(x));
        return y * this.width + x;
      });
  }

  dropBytes(count: number) {
    const fallen = Math.min(count, this.bytes.length - this.bytesFallen);
    for (let i = 0; i < fallen; i++) {
      this[this.bytes[this.bytesFallen + i]] = Byte.Corrupted;
    }
    this.bytesFallen += fallen;
  }

  toString() {
    let res = "";
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        res += this[y * this.width + x];
      }
      res += "\n";
    }
    return res;
  }

  index(v: Vector): number {
    return v.y * this.width + v.x;
  }

  findPath(): Vector[] {
    const start = new Vector(0, 0);
    const end = new Vector(this.width - 1, this.height - 1);
    const openEnds: Vector[] = [start];
    const visited: Set<string> = new Set();
    const before: Map<string, Vector> = new Map();

    const key = (v: Vector) => `${v.x},${v.y}`;
    visited.add(key(start));

    while (openEnds.length > 0) {
      const current = openEnds.shift()!;
      if (current.x === end.x && current.y === end.y) {
        // We've reached the goal, now backtrack and collect the path elements
        const path: Vector[] = [];
        let step: Vector | undefined = current;
        while (step) {
          path.push(step);
          step = before.get(key(step));
        }
        return path.reverse();
      }

      const neighbors = [
        new Vector(current.x + 1, current.y),
        new Vector(current.x - 1, current.y),
        new Vector(current.x, current.y + 1),
        new Vector(current.x, current.y - 1),
      ].filter(
        (n) =>
          n.x >= 0 &&
          n.x < this.width &&
          n.y >= 0 &&
          n.y < this.height &&
          this[n.y * this.width + n.x] !== Byte.Corrupted &&
          !visited.has(key(n)),
      );

      for (const neighbor of neighbors) {
        openEnds.push(neighbor);
        visited.add(key(neighbor));
        before.set(key(neighbor), current);
      }
    }

    return [];
  }

  get pathLength(): number {
    return this.findPath().length;
  }

  get maxBytes(): number {
    let lastStep = -1;

    // Repeatedly find our path to the exit
    for (let path = this.findPath(); path.length > 0; path = this.findPath()) {
      let minI = Number.MAX_SAFE_INTEGER;
      // Now go over all steps in the path
      for (const step of path) {
        const si = this.index(step);
        const i = this.bytes.indexOf(si);
        // Can we find a falling byte in the path and does it happen earlier?
        if (i !== -1 && i < minI) {
          minI = i;
        }
      }
      if (minI !== Number.MAX_SAFE_INTEGER) {
        this.dropBytes(minI - this.bytesFallen + 1);
        lastStep = minI;
        continue;
      }
      // This shouldn't ever happen, but if the path is never blocked…
      break;
    }
    return lastStep;
  }
}

const solve_1 = (
  file: string,
  fallen: number = 1024,
  width?: number,
  height?: number,
): number => {
  const g = new Grid(file, width, height);
  g.dropBytes(fallen);
  return g.pathLength - 1;
};

const solve_2 = (file: string, width?: number, height?: number): string => {
  const g = new Grid(file, width, height);
  const b = g.bytes[g.maxBytes];
  return `${b % g.width},${Math.floor(b / g.width)}`;
};

export const main = (): void => {
  console.log("Example 1:", solve_1(example, 12, 7, 7));
  console.log("Solution 1:", solve_1(input));
  console.log("Example 2:", solve_2(example, 7, 7));
  console.log("Solution 2:", solve_2(input));
};
