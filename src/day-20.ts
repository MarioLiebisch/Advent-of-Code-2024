const example: string = "data/example-20.txt";
const input: string = "data/input-20.txt";

import fs from "fs";

interface Vector {
  x: number;
  y: number;
}

const solve_1 = (file: string): number => {
  const map = fs
    .readFileSync(file, "utf-8")
    .split(/\r?\n/)
    .filter((line) => line.length > 0);
  const width = map[0].length;
  const height = map.length;

  const start: Vector = { x: 0, y: 0 };
  const end: Vector = { x: 0, y: 0 };
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      switch (map[y][x]) {
        case "S":
          start.x = x;
          start.y = y;
          break;
        case "E":
          end.x = x;
          end.y = y;
          break;
      }
      if ((start.x || start.y) && (end.x || end.y)) {
        break;
      }
    }
    if ((start.x || start.y) && (end.x || end.y)) {
      break;
    }
  }

  const solve = (start: Vector): Vector[] => {
    const queue: Vector[][] = [[start]];
    const visited: Set<string> = new Set();

    while (queue.length > 0) {
      const path = queue.shift()!;
      const { x, y } = path[path.length - 1];
      if (x === end.x && y === end.y) {
        return path;
      }

      const key = `${x},${y}`;
      if (visited.has(key)) {
        continue;
      }
      visited.add(key);

      const directions: Vector[] = [
        { x: 0, y: -1 },
        { x: 0, y: 1 },
        { x: -1, y: 0 },
        { x: 1, y: 0 },
      ];

      for (const { x: dx, y: dy } of directions) {
        const nx = x + dx;
        const ny = y + dy;
        if (nx < 0 || nx >= width || ny < 0 || ny >= height) {
          continue;
        }

        if (map[ny][nx] === "#") {
          continue;
        }

        const np: Vector = { x: nx, y: ny };
        const npk = `${nx},${ny}`;
        if (visited.has(npk)) {
          continue;
        }

        queue.push([...path, np]);
      }
    }
    return [];
  };

  const fair_path = solve(start);

  // Find all positions to cheat
  const cheatableWalls: Vector[] = [];
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      if (map[y][x] !== "#") continue;
      if (
        (map[y][x - 1] !== "#" && map[y][x + 1] !== "#") ||
        (map[y - 1][x] !== "#" && map[y + 1][x] !== "#")
      ) {
        cheatableWalls.push({ x, y });
      }
    }
  }

  // Remove cheatable walls not next to the original route
  cheatableWalls.filter((wall) =>
    fair_path.some(
      (step) =>
        (Math.abs(step.x - wall.x) == 1 && Math.abs(step.y - wall.y) == 0) ||
        (Math.abs(step.x - wall.x) == 0 && Math.abs(step.y - wall.y) == 1),
    ),
  );

  let res = 0;
  // Since all position are on the route, we can just check the distance between the two steps next to the wall
  for (const wall of cheatableWalls) {
    const step_top = fair_path.findIndex(
      (step) => step.x === wall.x && step.y === wall.y - 1,
    );
    const step_bottom = fair_path.findIndex(
      (step) => step.x === wall.x && step.y === wall.y + 1,
    );
    const step_left = fair_path.findIndex(
      (step) => step.x === wall.x - 1 && step.y === wall.y,
    );
    const step_right = fair_path.findIndex(
      (step) => step.x === wall.x + 1 && step.y === wall.y,
    );

    if (step_top !== -1 && step_bottom !== -1) {
      const saving = Math.abs(step_top - step_bottom) - 2;
      if (saving >= 100) {
        res++;
      }
    } else if (step_left !== -1 && step_right !== -1) {
      const saving = Math.abs(step_left - step_right) - 2;
      if (saving >= 100) {
        res++;
      }
    }
  }
  return res;
};

const solve_2 = (file: string): number => {
  const map = fs
    .readFileSync(file, "utf-8")
    .split(/\r?\n/)
    .filter((line) => line.length > 0);
  const width = map[0].length;
  const height = map.length;

  const start: Vector = { x: 0, y: 0 };
  const end: Vector = { x: 0, y: 0 };
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      switch (map[y][x]) {
        case "S":
          start.x = x;
          start.y = y;
          break;
        case "E":
          end.x = x;
          end.y = y;
          break;
      }
      if ((start.x || start.y) && (end.x || end.y)) {
        break;
      }
    }
    if ((start.x || start.y) && (end.x || end.y)) {
      break;
    }
  }

  const solve = (start: Vector): Vector[] => {
    const queue: Vector[][] = [[start]];
    const visited: Set<string> = new Set();

    while (queue.length > 0) {
      const path = queue.shift()!;
      const { x, y } = path[path.length - 1];
      if (x === end.x && y === end.y) {
        return path;
      }

      const key = `${x},${y}`;
      if (visited.has(key)) {
        continue;
      }
      visited.add(key);

      const directions: Vector[] = [
        { x: 0, y: -1 },
        { x: 0, y: 1 },
        { x: -1, y: 0 },
        { x: 1, y: 0 },
      ];

      for (const { x: dx, y: dy } of directions) {
        const nx = x + dx;
        const ny = y + dy;
        if (nx < 0 || nx >= width || ny < 0 || ny >= height) {
          continue;
        }

        if (map[ny][nx] === "#") {
          continue;
        }

        const np: Vector = { x: nx, y: ny };
        const npk = `${nx},${ny}`;
        if (visited.has(npk)) {
          continue;
        }

        queue.push([...path, np]);
      }
    }
    return [];
  };

  const fair_path = solve(start);
  const fair_path_length = fair_path.length;

  let res = 0;

  // Only for debugging/testing with the example
  const saves: Map<number, number> = new Map();

  // Pick all possible positions to start cheating
  for (let from_index = 0; from_index < fair_path_length; from_index++) {
    // Find all positions that are at most 20 manhattan distance away
    for (
      let to_index = from_index + 1;
      to_index < fair_path_length;
      to_index++
    ) {
      // Check manhattan distance
      const manhattan =
        Math.abs(fair_path[from_index].x - fair_path[to_index].x) +
        Math.abs(fair_path[from_index].y - fair_path[to_index].y);
      if (manhattan > 20) {
        continue;
      }
      // Saving is the distance between the two steps minus the manhattan distance
      const saving = to_index - from_index - manhattan;
      if (saving >= 50) {
        saves.set(saving, (saves.get(saving) ?? 0) + 1);
      }
      if (saving >= 100) {
        res++;
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
