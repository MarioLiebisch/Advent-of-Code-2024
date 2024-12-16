const example1: string = "data/example-16a.txt";
const example2: string = "data/example-16b.txt";
const input: string = "data/input-16.txt";

import fs from "fs";

enum Direction {
  NONE = ".",
  UP = "U",
  DOWN = "D",
  LEFT = "L",
  RIGHT = "R",
}

class Vector {
  x: number = 0;
  y: number = 0;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }
}

class StackEntry {
  pos: Vector;
  dir: Direction;
  path: number[];
  costs: number;
}

class Maze extends Array<string> {
  start: Vector = new Vector(0, 0);
  end: Vector = new Vector(0, 0);
  width: number = 0;
  height: number = 0;

  constructor(file: string) {
    super();

    for (const line of fs
      .readFileSync(file, "utf-8")
      .split(/\r?\n/)
      .filter((line) => line.length > 0)) {
      this.push(line);
      const so = line.indexOf("S");
      const eo = line.indexOf("E");
      if (so >= 0) {
        this.start = new Vector(so, this.length - 1);
      }
      if (eo >= 0) {
        this.end = new Vector(eo, this.length - 1);
      }
    }
    this.width = this[0].length;
    this.height = this.length;
  }

  // Third or so rewrite, I'm still missing routes in example 1, but get
  // the correct results for the actual puzzle input.
  findRoute(): { score: number; tiles: number } {
    const enc = (x: number, y: number): number => y * this.width + x;

    const previousCosts: { [key: number]: number } = {};

    const stack: StackEntry[] = [
      {
        pos: this.start,
        dir: Direction.RIGHT,
        path: [],
        costs: 0,
      },
    ];

    let current: StackEntry | undefined;
    let paths: number[][] = [];
    let minCosts = Number.MAX_SAFE_INTEGER;
    while ((current = stack.shift()) !== undefined) {
      const id = enc(current.pos.x, current.pos.y);
      current.path.push(id);
      // Did we reach the goal?
      if (this.end.x === current.pos.x && this.end.y === current.pos.y) {
        if (current.costs < minCosts) {
          minCosts = current.costs;
          paths = [current.path];
        } else if (current.costs === minCosts) {
          paths.push(current.path);
        }
        continue;
      }

      // Previous costs to this tile are lower?
      if (
        previousCosts[id] !== undefined &&
        previousCosts[id] < current.costs
      ) {
        continue;
      }
      previousCosts[id] = current.costs;

      // Previous costs to the goal are lower?
      if (current.costs > minCosts) {
        continue;
      }

      // Try all possibilities
      [Direction.LEFT, Direction.RIGHT, Direction.UP, Direction.DOWN].forEach(
        (dir) => {
          const npos = { ...current!.pos };
          switch (dir) {
            case Direction.LEFT:
              if (current?.dir === Direction.RIGHT) {
                return;
              }
              npos.x--;
              break;
            case Direction.RIGHT:
              if (current?.dir === Direction.LEFT) {
                return;
              }
              npos.x++;
              break;
            case Direction.UP:
              if (current?.dir === Direction.DOWN) {
                return;
              }
              npos.y--;
              break;
            case Direction.DOWN:
              if (current?.dir === Direction.UP) {
                return;
              }
              npos.y++;
              break;
          }
          if (this[npos.y][npos.x] === "#") {
            return;
          }
          stack.push({
            pos: npos,
            dir: dir,
            path: current!.path.slice(),
            costs: current!.costs + (dir !== current!.dir ? 1001 : 1),
          });
        },
      );
    }

    const tiles: Set<number> = new Set();
    paths.forEach((path) => {
      path.forEach((pos) => tiles.add(pos));
    });

    // Debug output
    // for (let y = 0; y < this.height; y++) {
    //   for (let x = 0; x < this.width; x++) {
    //     if (this[y][x] === "#") {
    //       process.stdout.write("#");
    //     } else if (tiles.has(enc(x, y))) {
    //       process.stdout.write("O");
    //     } else {
    //       process.stdout.write(".");
    //     }
    //   }
    //   process.stdout.write("\n");
    // }

    return { score: minCosts, tiles: tiles.size };
  }
}

const solve_1 = (file: string): number => {
  return new Maze(file).findRoute().score;
};

const solve_2 = (file: string): number => {
  return new Maze(file).findRoute().tiles;
};

export const main = (): void => {
  console.log("Example 1a:", solve_1(example1));
  console.log("Example 1b:", solve_1(example2));
  console.log("Solution 1:", solve_1(input));
  console.log("Example 2a:", solve_2(example1));
  console.log("Example 2b:", solve_2(example2));
  console.log("Solution 2:", solve_2(input));
};
