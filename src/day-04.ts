const example: string = "data/example-04.txt";
const input: string = "data/input-04.txt";

import fs from "fs";

const solve_1 = (file: string): number => {
  const data = fs
    .readFileSync(file, "utf8")
    .split(/\r?\n/)
    .filter((x) => x.length > 0);

  const width = data[0].length;
  const height = data.length;

  let count = 0;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      switch (data[y][x]) {
        case "X": // Find forward
          if (x < width - 3 && data[y].substring(x + 1, x + 4) === "MAS") {
            ++count;
          }
          if (
            y < height - 3 &&
            data[y + 1][x] === "M" &&
            data[y + 2][x] === "A" &&
            data[y + 3][x] === "S"
          ) {
            ++count;
          }
          if (
            x < width - 3 &&
            y < height - 3 &&
            data[y + 1][x + 1] === "M" &&
            data[y + 2][x + 2] === "A" &&
            data[y + 3][x + 3] === "S"
          ) {
            ++count;
          }
          if (
            x > 2 &&
            y < height - 3 &&
            data[y + 1][x - 1] === "M" &&
            data[y + 2][x - 2] === "A" &&
            data[y + 3][x - 3] === "S"
          ) {
            ++count;
          }
          break;
        case "S": // Find backwards
          if (x < width - 3 && data[y].substring(x + 1, x + 4) === "AMX") {
            ++count;
          }
          if (
            y < height - 3 &&
            data[y + 1][x] === "A" &&
            data[y + 2][x] === "M" &&
            data[y + 3][x] === "X"
          ) {
            ++count;
          }
          if (
            x < width - 3 &&
            y < height - 3 &&
            data[y + 1][x + 1] === "A" &&
            data[y + 2][x + 2] === "M" &&
            data[y + 3][x + 3] === "X"
          ) {
            ++count;
          }
          if (
            x > 2 &&
            y < height - 3 &&
            data[y + 1][x - 1] === "A" &&
            data[y + 2][x - 2] === "M" &&
            data[y + 3][x - 3] === "X"
          ) {
            ++count;
          }
          break;
      }
    }
  }

  return count;
};

const solve_2 = (file: string): number => {
  const data = fs
    .readFileSync(file, "utf8")
    .split(/\r?\n/)
    .filter((x) => x.length > 0);

  const width = data[0].length;
  const height = data.length;

  let count = 0;

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      if (data[y][x] !== "A") {
        continue;
      }

      const diag1 =
        (data[y - 1][x - 1] == "M" && data[y + 1][x + 1] == "S") ||
        (data[y - 1][x - 1] == "S" && data[y + 1][x + 1] == "M");
      const diag2 =
        (data[y - 1][x + 1] == "M" && data[y + 1][x - 1] == "S") ||
        (data[y - 1][x + 1] == "S" && data[y + 1][x - 1] == "M");
      if (diag1 && diag2) {
        ++count;
      }
    }
  }

  return count;
};

export const main = (args: string[]): void => {
  console.log(args);
  console.log("Example 1:", solve_1(example));
  console.log("Solution 1:", solve_1(input));
  console.log("Example 2:", solve_2(example));
  console.log("Solution 2:", solve_2(input));
};
