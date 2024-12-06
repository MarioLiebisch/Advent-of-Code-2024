const example: string = "data/example-06.txt";
const input: string = "data/input-06.txt";

import fs from "fs";

type LabMap = string[];

enum Direction {
  UP = 0,
  RIGHT = 1,
  DOWN = 2,
  LEFT = 3,
}

type Guard = {
  x: number;
  y: number;
  d: Direction;
  s: number;
};

const solve_1 = (file: string): number => {
  const map: LabMap = fs
    .readFileSync(file, "utf-8")
    .split(/\r?\n/)
    .filter((line) => line.length > 0);

  const guard: Guard = { x: 0, y: 0, d: Direction.UP, s: 1 };

  const width = map[0].length;
  const height = map.length;

  map.forEach((line, y) => {
    const x = line.indexOf("^");
    if (x != -1) {
      guard.x = x;
      guard.y = y;
      map[y] = map[y].slice(0, x) + "X" + map[y].slice(x + 1);
    }
  });

  for (;;) {
    let nx = guard.x;
    let ny = guard.y;
    switch (guard.d) {
      case Direction.UP:
        ny--;
        break;
      case Direction.RIGHT:
        nx++;
        break;
      case Direction.DOWN:
        ny++;
        break;
      case Direction.LEFT:
        nx--;
        break;
    }

    if (nx < 0 || nx >= width || ny < 0 || ny >= height) {
      break;
    }

    switch (map[ny][nx]) {
      case "#":
        guard.d = (guard.d + 1) % 4;
        continue;
      case ".":
        map[ny] = map[ny].slice(0, nx) + "X" + map[ny].slice(nx + 1);
        guard.s++;
        continue;
    }
    guard.x = nx;
    guard.y = ny;
  }
  return guard.s;
};

const solve_2 = (file: string): number => {
  const defmap: LabMap = fs
    .readFileSync(file, "utf-8")
    .split(/\r?\n/)
    .filter((line) => line.length > 0);

  const defguard: Guard = { x: 0, y: 0, d: Direction.UP, s: 1 };

  const width = defmap[0].length;
  const height = defmap.length;

  defmap.forEach((line, y) => {
    const x = line.indexOf("^");
    if (x != -1) {
      defguard.x = x;
      defguard.y = y;
      defmap[y] = defmap[y].slice(0, x) + "X" + defmap[y].slice(x + 1);
    }
  });

  let res = 0;
  // Way too naive approach, but calculating possible positions I always had one out of whack ;)
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const guard = { ...defguard };
      const map = [...defmap];

      if (map[y][x] != ".") {
        continue;
      }
      map[y] = map[y].slice(0, x) + "#" + map[y].slice(x + 1);

      let steps;
      const steps_consider_it_infinite = 100000;
      for (steps = 0; steps < steps_consider_it_infinite; ++steps) {
        let nx = guard.x;
        let ny = guard.y;
        switch (guard.d) {
          case Direction.UP:
            ny--;
            break;
          case Direction.RIGHT:
            nx++;
            break;
          case Direction.DOWN:
            ny++;
            break;
          case Direction.LEFT:
            nx--;
            break;
        }

        if (nx < 0 || nx >= width || ny < 0 || ny >= height) {
          break;
        }

        switch (map[ny][nx]) {
          case "#":
            guard.d = (guard.d + 1) % 4;
            continue;
          case ".":
            map[ny] = map[ny].slice(0, nx) + "X" + map[ny].slice(nx + 1);
            guard.s++;
            continue;
        }
        guard.x = nx;
        guard.y = ny;
      }
      if (steps == steps_consider_it_infinite) {
        ++res;
      }
    }
  }
  return res;
};

export const main = (): void => {
  console.log("Example 1:", solve_1(example));
  console.log("Solution 1:", solve_1(input));
  console.log("Example 2:", solve_2(example));
  console.log("Solution 2:", solve_2(input));
};
