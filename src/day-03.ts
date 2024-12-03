const example1: string = "data/example-03a.txt";
const example2: string = "data/example-03b.txt";
const input: string = "data/input-03.txt";

import fs from "fs";

const solve_1 = (file: string): number => {
  const data = fs.readFileSync(file, "utf-8").replaceAll(/(?:\r?\n)+/g, "");
  let res = 0;
  for (const match of data.matchAll(/mul\((\d{1,3}),(\d{1,3})\)/g)) {
    res += parseInt(match[1]) * parseInt(match[2]);
  }
  return res;
};

const solve_2 = (file: string): number => {
  const data = fs.readFileSync(file, "utf-8").replaceAll(/(?:\r?\n)+/g, "");
  let res = 0;
  let enabled = true;
  for (const match of data.matchAll(
    /do\(\)|don't\(\)|mul\((\d{1,3}),(\d{1,3})\)/g,
  )) {
    if (match[0] === "do()") {
      enabled = true;
    } else if (match[0] === "don't()") {
      enabled = false;
    } else if (enabled) {
      res += parseInt(match[1]) * parseInt(match[2]);
    }
  }
  return res;
};

export const main = (args: string[]): void => {
  console.log(args);
  console.log("Example 1:", solve_1(example1));
  console.log("Solution 1:", solve_1(input));
  console.log("Example 2:", solve_2(example2));
  console.log("Solution 2:", solve_2(input));
};
