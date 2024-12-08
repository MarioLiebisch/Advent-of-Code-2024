const example: string = "data/example-08.txt";
const input: string = "data/input-08.txt";

import fs from "fs";

const solve_1 = (file: string): number => {
  const antennas: { [key: string]: { x: number; y: number }[] } = {};
  const antinodes: { x: number; y: number }[] = [];
  const content = fs
    .readFileSync(file, "utf-8")
    .split(/\r?\n/)
    .filter((line) => line.length > 0);
  content.forEach((line, y) => {
    line.split("").forEach((c, x) => {
      if (c != ".") {
        if (!antennas[c]) {
          antennas[c] = [];
        }
        antennas[c].push({ x, y });
      }
    });
  });

  const width = content[0].length;
  const height = content.length;

  for (const as of Object.values(antennas)) {
    for (const a of as) {
      for (const b of as) {
        if (a == b) {
          continue;
        }
        const dx = b.x - a.x;
        const dy = b.y - a.y;

        const an1 = { x: a.x - dx, y: a.y - dy };
        if (an1.x >= 0 && an1.x < width && an1.y >= 0 && an1.y < height) {
          if (!antinodes.find((an) => an.x === an1.x && an.y === an1.y)) {
            antinodes.push(an1);
          }
        }
        const an2 = { x: b.x + dx, y: b.y + dy };
        if (an2.x >= 0 && an2.x < width && an2.y >= 0 && an2.y < height) {
          if (!antinodes.find((an) => an.x === an2.x && an.y === an2.y)) {
            antinodes.push(an2);
          }
        }
      }
    }
  }
  return antinodes.length;
};

const solve_2 = (file: string): number => {
  const antennas: { [key: string]: { x: number; y: number }[] } = {};
  const antinodes: { x: number; y: number }[] = [];
  const content = fs
    .readFileSync(file, "utf-8")
    .split(/\r?\n/)
    .filter((line) => line.length > 0);
  content.forEach((line, y) => {
    line.split("").forEach((c, x) => {
      if (c != ".") {
        if (!antennas[c]) {
          antennas[c] = [];
        }
        antennas[c].push({ x, y });
      }
    });
  });

  const width = content[0].length;
  const height = content.length;

  for (const as of Object.values(antennas)) {
    for (const a of as) {
      for (const b of as) {
        if (a == b) {
          continue;
        }
        const dx = b.x - a.x;
        const dy = b.y - a.y;

        for (let n = 0; ; ++n) {
          let fit1 = true;
          const an1 = { x: a.x - dx * n, y: a.y - dy * n };
          if (an1.x >= 0 && an1.x < width && an1.y >= 0 && an1.y < height) {
            if (!antinodes.find((an) => an.x === an1.x && an.y === an1.y)) {
              antinodes.push(an1);
            }
          } else {
            fit1 = false;
          }
          let fit2 = true;
          const an2 = { x: b.x + dx * n, y: b.y + dy * n };
          if (an2.x >= 0 && an2.x < width && an2.y >= 0 && an2.y < height) {
            if (!antinodes.find((an) => an.x === an2.x && an.y === an2.y)) {
              antinodes.push(an2);
            }
          } else {
            fit2 = false;
          }
          if (!fit1 && !fit2) {
            break;
          }
        }
      }
    }
  }

  return antinodes.length;
};

export const main = (): void => {
  console.log("Example 1:", solve_1(example));
  console.log("Solution 1:", solve_1(input));
  console.log("Example 2:", solve_2(example));
  console.log("Solution 2:", solve_2(input));
};
