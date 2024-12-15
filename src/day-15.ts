const example1: string = "data/example-15a.txt";
const example2: string = "data/example-15b.txt";
const example3: string = "data/example-15c.txt";
const input: string = "data/input-15.txt";

import fs from "fs";

enum Direction {
  UP = "^",
  LEFT = "<",
  RIGHT = ">",
  DOWN = "v",
}

const INTERSECT_MARGIN = 0.5;
class Rect {
  x: number;
  y: number;
  width: number;
  height: number;
  constructor(x: number, y: number, width: number = 1, height: number = 1) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  }

  intersects(other: Rect): boolean {
    return (
      this.x + this.width - INTERSECT_MARGIN >= other.x &&
      this.x < other.x + other.width - INTERSECT_MARGIN &&
      this.y + this.height - INTERSECT_MARGIN >= other.y &&
      this.y < other.y + other.height - INTERSECT_MARGIN
    );
  }
}
class RobotMap {
  obstacles: Rect[] = [];
  boxes: Rect[] = [];
  robot: Rect;
  instructions: string = "";
  steps: number = 0;
  width: number = 0;
  height: number = 0;

  constructor(file: string, scale_x: number = 1) {
    let in_instructions: boolean = false;
    for (const line of fs.readFileSync(file, "utf-8").split(/\r?\n/)) {
      if (!in_instructions) {
        if (line === "") {
          in_instructions = true;
          continue;
        }
        this.width = line.length * scale_x;
        for (let x = 0; x < line.length; x++) {
          switch (line[x]) {
            case "@":
              this.robot = new Rect(x * scale_x, this.height);
              break;
            case "#": {
              let end = x + 1;
              for (; end < line.length && line[end] === "#"; end++);
              this.obstacles.push(
                new Rect(x * scale_x, this.height, (end - x) * scale_x, 1),
              );
              x = end - 1;
              break;
            }
            case "O":
              this.boxes.push(new Rect(x * scale_x, this.height, scale_x));
              break;
          }
        }
        this.height++;
        continue;
      }
      this.instructions += line;
    }
  }

  get_moving_boxes(box: Rect, direction: Direction): Set<Rect> | null {
    const target = new Rect(box.x, box.y, box.width, box.height);
    switch (direction) {
      case Direction.UP:
        target.y--;
        break;
      case Direction.LEFT:
        target.x--;
        break;
      case Direction.RIGHT:
        target.x++;
        break;
      case Direction.DOWN:
        target.y++;
        break;
    }
    for (const obstacle of this.obstacles) {
      if (target.intersects(obstacle)) {
        return null;
      }
    }
    const ret: Set<Rect> = new Set();
    for (const obox of this.boxes) {
      if (obox === box) {
        continue;
      }
      if (target.intersects(obox)) {
        const moved_by_this = this.get_moving_boxes(obox, direction);
        if (!moved_by_this) {
          return null;
        }
        for (const moved of moved_by_this) {
          ret.add(moved);
        }
        ret.add(obox);
      }
    }
    return ret;
  }

  step(): boolean {
    if (this.steps >= this.instructions.length) {
      return false;
    }
    const direction = this.instructions[this.steps] as Direction;
    const moving_boxes = this.get_moving_boxes(this.robot, direction);
    this.steps++;
    if (!moving_boxes) {
      return true;
    }
    for (const box of moving_boxes) {
      switch (direction) {
        case Direction.UP:
          box.y--;
          break;
        case Direction.LEFT:
          box.x--;
          break;
        case Direction.RIGHT:
          box.x++;
          break;
        case Direction.DOWN:
          box.y++;
          break;
      }
    }
    switch (direction) {
      case Direction.UP:
        this.robot.y--;
        break;
      case Direction.LEFT:
        this.robot.x--;
        break;
      case Direction.RIGHT:
        this.robot.x++;
        break;
      case Direction.DOWN:
        this.robot.y++;
        break;
    }
    return true;
  }

  toString(): string {
    const out = new Array(this.height).fill(" ".repeat(this.width));
    for (const obstacle of this.obstacles) {
      for (let y = obstacle.y; y < obstacle.y + obstacle.height; y++) {
        out[y] =
          out[y].substring(0, obstacle.x) +
          "#".repeat(obstacle.width) +
          out[y].substring(obstacle.x + obstacle.width);
      }
    }
    for (const box of this.boxes) {
      for (let y = box.y; y < box.y + box.height; y++) {
        if (box.width === 2) {
          out[y] =
            out[y].substring(0, box.x) +
            "[]" +
            out[y].substring(box.x + box.width);
          continue;
        }
        out[y] =
          out[y].substring(0, box.x) +
          "O".repeat(box.width) +
          out[y].substring(box.x + box.width);
      }
    }
    out[this.robot.y] =
      out[this.robot.y].substring(0, this.robot.x) +
      "@" +
      out[this.robot.y].substring(this.robot.x + 1);
    return out.join("\n");
  }

  get gps(): number {
    let res = 0;
    for (const box of this.boxes) {
      res += box.y * 100 + box.x;
    }
    return res;
  }
}

const solve_1 = (file: string): number => {
  const map = new RobotMap(file);
  for (; map.step(); );
  return map.gps;
};

const solve_2 = (file: string): number => {
  const map = new RobotMap(file, 2);
  for (; map.step(); );
  return map.gps;
};

export const main = (): void => {
  console.log("Example 1a:", solve_1(example1));
  console.log("Example 1b:", solve_1(example2));
  console.log("Solution 1:", solve_1(input));

  console.log("Example 2a:", solve_2(example3));
  console.log("Example 2b:", solve_2(example1));
  console.log("Solution 2:", solve_2(input));
};
