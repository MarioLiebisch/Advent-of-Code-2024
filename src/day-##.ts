const example: string = "data/example-##.txt";
const input: string = "data/input-##.txt";

import fs from "fs";

const solve_1 = (file: string): number => {
  console.log(file);
  return 0;
};

const solve_2 = (file: string): number => {
  console.log(file);
  return 0;
};

export const main = (): void => {
  console.log("Example 1:", solve_1(example));
  console.log("Solution 1:", solve_1(input));
  console.log("Example 2:", solve_2(example));
  console.log("Solution 2:", solve_2(input));
};
