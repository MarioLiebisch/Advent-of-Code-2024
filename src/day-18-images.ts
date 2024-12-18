const example: string = "data/example-18.txt";
const input: string = "data/input-18.txt";

import fs from "fs";
import PNGlib from "./lib/pnglib.js";

PNGlib.prototype.rect = function (x, y, w, h, color, outline) {
  for (let i = 0; i < w; i++) {
    for (let j = 0; j < h; j++) {
      if (i === 0 || i === w - 1 || j === 0 || j === h - 1) {
        this.buffer[this.index(x + i, y + j)] = outline;
      } else {
        this.buffer[this.index(x + i, y + j)] = color;
      }
    }
  }
};

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

  imageIndex: number = 0;

  writeImage(path: Vector[] = [], scale: number = 4, red: boolean = false) {
    const img = new PNGlib(this.width * scale, this.height * scale, 256);
    img.color(255, 255, 255);
    const c_outline = img.color(0, 0, 0);
    const c_wall = img.color(255, 0, 0);
    const c_path = img.color(0, 255, 0);
    const c_path2 = img.color(255, 127, 0);

    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const i = y * this.width + x;
        if (this[i] === Byte.Corrupted) {
          img.rect(x * scale, y * scale, scale, scale, c_wall, c_outline);
        }
      }
    }

    if (path.length > 1) {
      for (let i = 0; i < path.length - 1; i++) {
        const a = path[i];
        const b = path[i + 1];

        const rx = Math.min(a.x, b.x);
        const ry = Math.min(a.y, b.y);
        const rw = Math.abs(a.x - b.x);
        const rh = Math.abs(a.y - b.y);
        img.rect(
          (rx + 0.25) * scale,
          (ry + 0.25) * scale,
          (rw + 0.5) * scale,
          (rh + 0.5) * scale,
          red ? c_path2 : c_path,
          red ? c_path2 : c_path,
        );
      }
    }

    fs.writeFileSync(
      `./images/step-${(this.imageIndex++).toString().padStart(4, "0")}.png`,
      img.getDump(),
      "binary",
    );
  }

  get maxBytes(): number {
    let lastStep = -1;

    this.writeImage([], 16);

    // Repeatedly find our path to the exit
    let path = this.findPath();
    while (path.length > 0) {
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
        this.dropBytes(minI - this.bytesFallen);
        this.writeImage(path, 16);
        this.dropBytes(1);
        this.writeImage(path, 16, true);
        path = this.findPath();
        this.writeImage(path, 16);

        lastStep = minI;
        continue;
      }
      // This shouldn't ever happen, but if the path is never blocked…
      break;
    }
    return lastStep;
  }
}

const solve_2 = (file: string, width?: number, height?: number): string => {
  const g = new Grid(file, width, height);
  const b = g.bytes[g.maxBytes];
  return `${b % g.width},${Math.floor(b / g.width)}`;
};

export const main = (): void => {
  // console.log("Example 2:", solve_2(example, 7, 7));
  console.log("Solution 2:", solve_2(input));
};
