const example1: string = "data/example-15a.txt";
const example2: string = "data/example-15b.txt";
const example3: string = "data/example-15c.txt";
const input: string = "data/input-15.txt";

import fs from "fs";

class Vector {
  x: number;
  y: number;
  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }
}

enum Direction {
  UP = "^",
  LEFT = "<",
  RIGHT = ">",
  DOWN = "v",
}

class RobotMap {
  map: string[] = [];
  instructions: string = "";
  width: number;
  height: number;
  instruction_index: number = 0;
  robot_position: Vector = new Vector(0, 0);

  constructor(file: string) {
    let in_instructions: boolean = false;
    for (const line of fs.readFileSync(file, "utf-8").split(/\r?\n/)) {
      if (!in_instructions) {
        if (line === "") {
          in_instructions = true;
          continue;
        }
        const ri = line.indexOf("@");
        if (ri !== -1) {
          this.robot_position = new Vector(ri, this.map.length);
          this.map.push(line.replace("@", "."));
          continue;
        }
        this.map.push(line);
        continue;
      }
      this.instructions += line;
    }
    this.width = this.map[0].length;
    this.height = this.map.length;
  }

  move(d: Direction): boolean {
    const move_target = this.find_move_endpoint(d);
    if (!move_target) {
      return false;
    }
    switch (d) {
      case Direction.UP:
        for (let y = move_target.y; y < this.robot_position.y; y++) {
          const tile = this.map[y + 1][this.robot_position.x];
          this.map[y] =
            this.map[y].substring(0, this.robot_position.x) +
            tile +
            this.map[y].substring(this.robot_position.x + 1);
        }
        this.map[this.robot_position.y] =
          this.map[this.robot_position.y].substring(0, this.robot_position.x) +
          "." +
          this.map[this.robot_position.y].substring(this.robot_position.x + 1);
        this.robot_position.y--;
        break;
      case Direction.LEFT:
        this.map[this.robot_position.y] =
          this.map[this.robot_position.y].substring(0, move_target.x) +
          this.map[this.robot_position.y].substring(
            move_target.x + 1,
            this.robot_position.x,
          ) +
          "." +
          this.map[this.robot_position.y].substring(this.robot_position.x);
        this.robot_position.x--;
        break;
      case Direction.RIGHT:
        this.map[this.robot_position.y] =
          this.map[this.robot_position.y].substring(
            0,
            this.robot_position.x + 1,
          ) +
          "." +
          this.map[this.robot_position.y].substring(
            this.robot_position.x + 1,
            move_target.x,
          ) +
          this.map[this.robot_position.y].substring(move_target.x + 1);
        this.robot_position.x++;
        break;
      case Direction.DOWN:
        for (let y = move_target.y; y > this.robot_position.y + 1; y--) {
          const tile = this.map[y - 1][this.robot_position.x];
          this.map[y] =
            this.map[y].substring(0, this.robot_position.x) +
            tile +
            this.map[y].substring(this.robot_position.x + 1);
        }
        this.map[this.robot_position.y + 1] =
          this.map[this.robot_position.y + 1].substring(
            0,
            this.robot_position.x,
          ) +
          "." +
          this.map[this.robot_position.y + 1].substring(
            this.robot_position.x + 1,
          );
        this.robot_position.y++;
        break;
    }
    return true;
  }

  find_move_endpoint(d: Direction): Vector | null {
    let x = this.robot_position.x;
    let y = this.robot_position.y;
    let dx = 0;
    let dy = 0;
    switch (d) {
      case Direction.UP:
        dy = -1;
        break;
      case Direction.LEFT:
        dx = -1;
        break;
      case Direction.RIGHT:
        dx = 1;
        break;
      case Direction.DOWN:
        dy = 1;
        break;
    }
    while (true) {
      x += dx;
      y += dy;
      if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
        return null;
      }
      switch (this.map[y][x]) {
        case ".":
          return new Vector(x, y);
        case "#":
          return null;
      }
    }
  }

  step(): boolean {
    if (this.instruction_index >= this.instructions.length) {
      return false;
    }
    return this.move(this.instructions[this.instruction_index++] as Direction);
  }

  get gps(): number {
    let res = 0;
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        if (this.map[y][x] === "O") {
          res += y * 100 + x;
        }
      }
    }
    return res;
  }

  toString(): string {
    let str = "";
    for (let y = 0; y < this.height; y++) {
      if (y === this.robot_position.y) {
        str +=
          this.map[y].substring(0, this.robot_position.x) +
          "@" +
          this.map[y].substring(this.robot_position.x + 1) +
          "\n";
        continue;
      }
      str += this.map[y] + "\n";
    }
    return str;
  }
}

const solve_1 = (file: string): number => {
  const map = new RobotMap(file);
  for (let i = 0; i < map.instructions.length; i++) {
    map.step();
  }
  return map.gps;
};

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
class RobotMapWide {
  obstacles: Rect[] = [];
  boxes: Rect[] = [];
  robot: Rect;
  instructions: string = "";
  steps: number = 0;
  width: number = 0;
  height: number = 0;

  constructor(file: string) {
    let in_instructions: boolean = false;
    for (const line of fs.readFileSync(file, "utf-8").split(/\r?\n/)) {
      if (!in_instructions) {
        if (line === "") {
          in_instructions = true;
          continue;
        }
        this.width = line.length * 2;
        for (let x = 0; x < line.length; x++) {
          switch (line[x]) {
            case "@":
              this.robot = new Rect(x * 2, this.height);
              break;
            case "#": {
              let end = x + 1;
              for (; end < line.length && line[end] === "#"; end++);
              this.obstacles.push(
                new Rect(x * 2, this.height, (end - x) * 2, 1),
              );
              x = end - 1;
              break;
            }
            case "O":
              this.boxes.push(new Rect(x * 2, this.height, 2));
              break;
          }
        }
        this.height++;
        continue;
      }
      this.instructions += line;
    }
    console.log();
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

const solve_2 = (file: string): number => {
  const map = new RobotMapWide(file);
  // console.log(map.toString());
  // console.log();
  for (; map.step(); ) {
    // console.log(map.toString());
    // console.log();
  }
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
