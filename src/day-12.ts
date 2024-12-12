const example1: string = "data/example-12a.txt";
const example2: string = "data/example-12b.txt";
const example3: string = "data/example-12c.txt";
const example4: string = "data/example-12d.txt";
const input: string = "data/input-12.txt";

import fs from "fs";

enum Direction {
  None = 0,
  Up = 1,
  Down = 2,
  Left = 4,
  Right = 8,
}

class Plot {
  x: number;
  y: number;
  fences: number;

  constructor(x: number, y: number, t: string, f: number) {
    this.x = x;
    this.y = y;
    this.fences = f;
  }

  costs(): number {
    let ret = 0;
    if (this.fences & Direction.Up) {
      ++ret;
    }
    if (this.fences & Direction.Down) {
      ++ret;
    }
    if (this.fences & Direction.Left) {
      ++ret;
    }
    if (this.fences & Direction.Right) {
      ++ret;
    }
    return ret;
  }
}

class Area extends Array<Plot> {
  type?: string;

  constructor(type?: string) {
    super();
    this.type = type;
  }

  circ_costs(): number {
    return this.length * this.reduce((acc, plot) => acc + plot.costs(), 0);
  }

  side_costs(): number {
    let ret = 0;
    if (this.length === 0) {
      return ret;
    }

    const fences: { [key: number]: Array<Plot> } = {
      [Direction.Up]: [],
      [Direction.Down]: [],
      [Direction.Left]: [],
      [Direction.Right]: [],
    };

    for (const p of this) {
      if (p.fences & Direction.Up) {
        fences[Direction.Up].push(p);
      }
      if (p.fences & Direction.Down) {
        fences[Direction.Down].push(p);
      }
      if (p.fences & Direction.Left) {
        fences[Direction.Left].push(p);
      }
      if (p.fences & Direction.Right) {
        fences[Direction.Right].push(p);
      }
    }

    fences[Direction.Left].sort((a, b) => {
      if (a.x === b.x) {
        return a.y - b.y;
      }
      return a.x - b.x;
    });
    fences[Direction.Right].sort((a, b) => {
      if (a.x === b.x) {
        return a.y - b.y;
      }
      return a.x - b.x;
    });
    fences[Direction.Up].sort((a, b) => {
      if (a.y === b.y) {
        return a.x - b.x;
      }
      return a.y - b.y;
    });
    fences[Direction.Down].sort((a, b) => {
      if (a.y === b.y) {
        return a.x - b.x;
      }
      return a.y - b.y;
    });

    // Get all "jumps" in x of left fences
    let x = -10;
    let y = -10;
    for (const p of fences[Direction.Left]) {
      if (p.x != x || p.y > y + 1) {
        ++ret;
      }
      x = p.x;
      y = p.y;
    }
    // Get all "jumps" in x of right fences
    x = -10;
    y = -10;
    for (const p of fences[Direction.Right]) {
      if (p.x != x || p.y > y + 1) {
        ++ret;
      }
      x = p.x;
      y = p.y;
    }
    // Get all "jumps" in y of top fences
    x = -10;
    y = -10;
    for (const p of fences[Direction.Up]) {
      if (p.y != y || p.x > x + 1) {
        ++ret;
      }
      x = p.x;
      y = p.y;
    }
    // Get all "jumps" in y of bottom fences
    x = -10;
    y = -10;
    for (const p of fences[Direction.Down]) {
      if (p.y != y || p.x > x + 1) {
        ++ret;
      }
      x = p.x;
      y = p.y;
    }
    return ret * this.length;
  }
}

class Garden extends Array<Area> {
  width: number;
  height: number;
  data: Array<string>;
  work: Array<string>;

  constructor(file: string) {
    super();

    this.data = fs
      .readFileSync(file, "utf-8")
      .split(/\r?\n/)
      .filter((line) => line.length);
    this.work = this.data.slice();
    this.width = this.data[0].length;
    this.height = this.data.length;

    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const tmp = this.getArea(x, y);
        if (tmp.length > 0) {
          this.push(tmp);
        }
      }
    }
  }

  circ_costs(): number {
    return this.reduce((acc, area) => acc + area.circ_costs(), 0);
  }

  side_costs(): number {
    return this.reduce((acc, area) => acc + area.side_costs(), 0);
  }

  private getArea(x: number, y: number, type: string = ""): Area {
    const t = this.work[y][x];
    if (t === "." || (type !== "" && t !== type)) {
      return new Area();
    }
    this.work[y] =
      this.work[y].substring(0, x) + "." + this.work[y].substring(x + 1);
    const ret = new Area(t);
    let fences = 0;
    // Left
    if (x > 0) {
      if (this.work[y][x - 1] === t) {
        ret.push(...this.getArea(x - 1, y, t));
      }
      if (this.data[y][x - 1] !== t) {
        fences |= Direction.Left;
      }
    } else {
      fences |= Direction.Left;
    }
    // Right
    if (x < this.width - 1) {
      if (this.work[y][x + 1] === t) {
        ret.push(...this.getArea(x + 1, y, t));
      }
      if (this.data[y][x + 1] !== t) {
        fences |= Direction.Right;
      }
    } else {
      fences |= Direction.Right;
    }
    // Up
    if (y > 0) {
      if (this.work[y - 1][x] === t) {
        ret.push(...this.getArea(x, y - 1, t));
      }
      if (this.data[y - 1][x] !== t) {
        fences |= Direction.Up;
      }
    } else {
      fences |= Direction.Up;
    }
    // Down
    if (y < this.height - 1) {
      if (this.work[y + 1][x] === t) {
        ret.push(...this.getArea(x, y + 1, t));
      }
      if (this.data[y + 1][x] !== t) {
        fences |= Direction.Down;
      }
    } else {
      fences |= Direction.Down;
    }
    ret.push(new Plot(x, y, t, fences));
    return ret;
  }
}

const solve_1 = (file: string): number => {
  const garden: Garden = new Garden(file);
  return garden.circ_costs();
};

const solve_2 = (file: string): number => {
  const garden: Garden = new Garden(file);
  return garden.side_costs();
};

export const main = (): void => {
  console.log("Example 1a:", solve_1(example1));
  console.log("Example 1b:", solve_1(example2));
  console.log("Example 1c:", solve_1(example3));
  console.log("Solution 1:", solve_1(input));
  console.log("Example 1a:", solve_2(example1));
  console.log("Example 2b:", solve_2(example2));
  console.log("Example 2c:", solve_2(example4));
  console.log("Example 2d:", solve_2(example3));
  console.log("Solution 2:", solve_2(input));
};
