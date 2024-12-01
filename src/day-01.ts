const example: string = "data/example-01.txt";
const input: string = "data/input-01.txt";

import fs from "fs";

type LocationList = number[];
type LocationLists = LocationList[];
type Tally = { [n: number]: number };

const readLocationLists = (file: string): LocationLists => {
  const res: LocationLists = [];

  const lines = fs.readFileSync(file, "utf-8").split("\n");

  const list_count = lines[0].split(" ").filter((x) => x !== "").length;

  for (let i = 0; i < list_count; i++) {
    res.push([]);
  }

  for (const line of lines) {
    if (line.length === 0) {
      continue;
    }

    const values = line
      .split(" ")
      .filter((x) => x !== "")
      .map((x) => parseInt(x));

    for (let i = 0; i < list_count; i++) {
      res[i].push(values[i]);
    }
  }

  return res;
};

const solve_1 = (file: string): number => {
  const lists = readLocationLists(file);

  for (let i = 0; i < lists.length; i++) {
    lists[i].sort();
  }

  const list_length = lists[0].length;

  let res = 0;
  for (let i = 0; i < list_length; i++) {
    res += Math.abs(lists[0][i] - lists[1][i]);
  }

  return res;
};

const solve_2 = (file: string): number => {
  const lists = readLocationLists(file);

  const tally: Tally = {};

  for (const l of lists[1]) {
    tally[l] = (tally[l] ?? 0) + 1;
  }

  let res = 0;
  for (const l of lists[0]) {
    res += l * (tally[l] ?? 0);
  }
  return res;
};

export const main = (): void => {
  console.log("Example 1:", solve_1(example));
  console.log("Solution 1:", solve_1(input));
  console.log("Example 2:", solve_2(example));
  console.log("Solution 2:", solve_2(input));
};
