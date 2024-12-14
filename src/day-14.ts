const example: string = "data/example-14.txt";
const input: string = "data/input-14.txt";

import fs, { mkdirSync } from "fs";
import PNGlib from "./lib/pnglib.js";

class Vector {
  x: number;
  y: number;
  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }
}

class Robot {
  position: Vector;
  velocity: Vector;
  constructor(position: Vector, velocity: Vector) {
    this.position = position;
    this.velocity = velocity;
  }
}

class RobotMap {
  robots: Robot[];
  width: number;
  height: number;
  count: number;

  constructor(file: string, width: number = 101, height: number = 103) {
    this.robots = [];
    this.width = width;
    this.height = height;
    this.count = 0;

    for (const line of fs
      .readFileSync(file, "utf8")
      .split(/\r?\n/)
      .filter((line) => line.length)) {
      const match = line.match(/p=(-?\d+),(-?\d+) v=(-?\d+),(-?\d+)/);
      if (match) {
        const position = new Vector(parseInt(match[1]), parseInt(match[2]));
        const velocity = new Vector(parseInt(match[3]), parseInt(match[4]));
        this.robots.push(new Robot(position, velocity));
      }
    }
  }

  step(): void {
    for (const robot of this.robots) {
      robot.position.x =
        (robot.position.x + robot.velocity.x + this.width) % this.width;
      robot.position.y =
        (robot.position.y + robot.velocity.y + this.height) % this.height;
    }
    ++this.count;
  }

  get safetyFactor(): number {
    const hw = Math.floor(this.width / 2);
    const hh = Math.floor(this.height / 2);
    const counts = [0, 0, 0, 0];
    for (const robot of this.robots) {
      if (robot.position.x == hw || robot.position.y == hh) {
        continue;
      }
      if (robot.position.x < hw && robot.position.y < hh) {
        counts[0]++;
      } else if (robot.position.x > hw && robot.position.y < hh) {
        counts[1]++;
      } else if (robot.position.x < hw && robot.position.y > hh) {
        counts[2]++;
      } else {
        counts[3]++;
      }
    }
    return counts.reduce((a, b) => a * b, 1);
  }

  // I could look for high density distributions on both x and y axis, but...
  render(): void {
    const img = new PNGlib(this.width, this.height, 256);
    img.color(0, 0, 0); // BG
    const brush = img.color(255, 255, 255);
    for (const robot of this.robots) {
      img.buffer[img.index(robot.position.x, robot.position.y)] = brush;
    }
    try {
      mkdirSync("./images");
    } catch {
      // Ignore
    }
    fs.writeFileSync(
      `./images/step-${this.count.toString().padStart(4, "0")}.png`,
      img.getDump(),
      "binary",
    );
  }
}

const solve_1 = (file: string, width?: number, height?: number): number => {
  const map = new RobotMap(file, width, height);
  for (let s = 0; s < 100; s++) {
    map.step();
  }
  return map.safetyFactor;
};

const solve_2 = (file: string, width?: number, height?: number): number => {
  const map = new RobotMap(file, width, height);
  map.render();
  for (let s = 0; s < 10000; s++) {
    map.step();
    map.render();
  }
  return -1;
};

export const main = (): void => {
  console.log("Example 1:", solve_1(example, 11, 7));
  console.log("Solution 1:", solve_1(input));
  console.log("Example 2:", solve_2(example, 11, 7));
  console.log("Solution 2:", solve_2(input));
};
