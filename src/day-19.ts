const example: string = "data/example-19.txt";
const input: string = "data/input-19.txt";

import fs from "fs";

const solve_1 = (file: string): number => {
  const parts = fs
    .readFileSync(file, "utf8")
    .trimEnd()
    .split(/\r?\n\r?\n/);

  const towels = parts[0].split(/, /);
  // Sort towel patterns by length as they should always get us done faster
  towels.sort((a, b) => b.length - a.length);

  const patterns = parts[1].split(/\r?\n/);

  let res = 0;

  for (const pattern of patterns) {
    const queue = [""];
    while (queue.length > 0) {
      const current = queue.shift() as string;
      let found: boolean = false;
      for (const towel of towels ?? []) {
        const p = current + towel;
        if (pattern.length < p.length) {
          continue;
        }
        if (pattern.startsWith(p)) {
          if (p.length === pattern.length) {
            res++;
            found = true;
            break;
          }
          queue.push(p);
        }
      }
      if (found) break;
      // Sort by length and remove duplicates
      queue.sort((a, b) => b.length - a.length);
      queue.filter((v, i, a) => a.indexOf(v) === i);
    }
  }

  return res;
};

const solve_2 = (file: string): number => {
  const parts = fs
    .readFileSync(file, "utf8")
    .trimEnd()
    .split(/\r?\n\r?\n/);

  const towels = parts[0].split(/, /);
  // This time sort shortest first to find as many duplicates as early as possible
  towels.sort((a, b) => a.length - b.length);

  const patterns = parts[1].split(/\r?\n/);

  let res = 0;

  for (const pattern of patterns) {
    const queue: { p: string; m: number }[] = [{ p: "", m: 1 }];
    while (queue.length > 0) {
      const current = queue.shift()!;
      for (const towel of towels ?? []) {
        const p = current?.p + towel;
        if (pattern.length < p.length) {
          continue;
        }
        if (pattern.startsWith(p)) {
          if (p.length === pattern.length) {
            res += current.m;
            continue;
          }
          let found: boolean = false;
          for (const qi of queue) {
            if (qi.p === p) {
              qi.m += current.m;
              found = true;
              break;
            }
          }
          if (!found) {
            queue.push({ p, m: current.m });
          }
        }
      }
      // Sort by length from shortest to longest
      queue.sort((a, b) => a.p.length - b.p.length);
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
