const example: string = "data/example-05.txt";
const input: string = "data/input-05.txt";

import fs from "fs";

type PageOrderRule = {
  first: number;
  second: number;
};
type PageList = number[];

const verify_order = (rules: PageOrderRule[], pages: PageList): boolean => {
  for (const rule of rules) {
    const firstIndex = pages.indexOf(rule.first);
    const secondIndex = pages.indexOf(rule.second);
    if (firstIndex === -1 || secondIndex === -1) {
      continue;
    }
    if (firstIndex > secondIndex) {
      return false;
    }
  }

  return true;
};

const fix_order = (rules: PageOrderRule[], pages: PageList): PageList => {
  let changed = true;
  while (changed) {
    changed = false;
    for (const rule of rules) {
      const firstIndex = pages.indexOf(rule.first);
      const secondIndex = pages.indexOf(rule.second);
      if (firstIndex === -1 || secondIndex === -1) {
        continue;
      }
      if (firstIndex > secondIndex) {
        pages[firstIndex] = rule.second;
        pages[secondIndex] = rule.first;
        changed = true;
        break;
      }
    }
  }

  return pages;
};

const get_middle = (pages: PageList): number => {
  return pages[Math.floor(pages.length / 2)];
};

const solve_1 = (file: string): number => {
  const rules: PageOrderRule[] = [];
  const pageLists: PageList[] = [];

  let inRules = true;

  for (const line of fs.readFileSync(file, "utf-8").split(/\r?\n/)) {
    if (line === "") {
      inRules = false;
      continue;
    }

    if (inRules) {
      const [first, second] = line.split("|").map((n) => parseInt(n));
      rules.push({ first, second });
    } else {
      const pages = line.split(",").map((n) => parseInt(n));
      pageLists.push(pages);
    }
  }

  let res = 0;
  for (const pages of pageLists) {
    if (verify_order(rules, pages)) {
      res += get_middle(pages);
    }
  }

  return res;
};

const solve_2 = (file: string): number => {
  const rules: PageOrderRule[] = [];
  const pageLists: PageList[] = [];

  let inRules = true;

  for (const line of fs.readFileSync(file, "utf-8").split(/\r?\n/)) {
    if (line === "") {
      inRules = false;
      continue;
    }

    if (inRules) {
      const [first, second] = line.split("|").map((n) => parseInt(n));
      rules.push({ first, second });
    } else {
      const pages = line.split(",").map((n) => parseInt(n));
      pageLists.push(pages);
    }
  }

  let res = 0;
  for (const pages of pageLists) {
    if (!verify_order(rules, pages)) {
      res += get_middle(fix_order(rules, pages));
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
