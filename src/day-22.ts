const example1: string = "data/example-22a.txt";
const example2: string = "data/example-22b.txt";
const input: string = "data/input-22.txt";

import fs from "fs";

// HACK: 64 bit XOR for JavaScript
// https://stackoverflow.com/a/78034728/409744
const xor64 = (a: number, b: number): number => {
  const hi = 0x80000000;
  const low = 0x7fffffff;
  const hia = ~~(a / hi);
  const hib = ~~(b / hi);
  const lowa = a & low;
  const lowb = b & low;
  const h = hia ^ hib;
  const l = lowa ^ lowb;
  return h * hi + l;
};

// HACK: 64 bit MOD for JavaScript
const mod64 = (a: number, b: number): number => {
  const as = a.toString();
  let tmp = "";
  for (let i = 0; i < as.length; i++) {
    tmp += as[i];
    tmp = (parseInt(tmp) % b).toString(10);
  }
  return parseInt(tmp);
};

const randomize = (secret: number): number => {
  secret = mod64(xor64(secret * 64, secret), 16777216);
  secret = mod64(xor64(Math.floor(secret / 32), secret), 16777216);
  secret = mod64(xor64(secret * 2048, secret), 16777216);
  return secret;
};

const solve_1 = (file: string): number => {
  const numbers = fs
    .readFileSync(file, "utf-8")
    .split(/\r?\n/)
    .filter((line) => line.length > 0)
    .map((line) => parseInt(line));
  for (let i = 0; i < 2000; i++) {
    for (let j = 0; j < numbers.length; j++) {
      numbers[j] = randomize(numbers[j]);
    }
  }
  return numbers.reduce((acc, cur) => acc + cur, 0);
};

const solve_2 = (file: string): number => {
  const numbers = fs
    .readFileSync(file, "utf-8")
    .split(/\r?\n/)
    .filter((line) => line.length > 0)
    .map((line) => parseInt(line));
  const prices: number[][] = new Array(numbers.length);
  const changes: number[][] = new Array(numbers.length);
  const opportunities: { [key: string]: number }[] = new Array(numbers.length);
  for (let j = 0; j < numbers.length; j++) {
    prices[j] = [0];
    changes[j] = [0];
    opportunities[j] = {};
  }
  for (let i = 0; i < 2000; i++) {
    for (let j = 0; j < numbers.length; j++) {
      const nn = randomize(numbers[j]);
      const np = mod64(nn, 10);
      const lp = prices[j][i];
      prices[j].push(np);
      changes[j].push(np - lp);
      numbers[j] = nn;

      // Is this a valid opportunity?
      if (i > 2) {
        const key = `${changes[j][i - 2]}:${changes[j][i - 1]}:${changes[j][i]}:${changes[j][i + 1]}`;
        // If we don't have a price, save it
        if (opportunities[j][key] === undefined) {
          opportunities[j][key] = np;
        }
      }
    }
  }

  // Get a list of all opportunities
  const op_list: Set<string> = new Set();
  for (let j = 0; j < numbers.length; j++) {
    for (const key in opportunities[j]) {
      op_list.add(key);
    }
  }

  // Find the best opportunity/sum of prices
  let best_opportunity = 0;
  let best_sequence = "";

  for (const key of op_list) {
    let sum = 0;
    for (let j = 0; j < numbers.length; j++) {
      sum += opportunities[j][key] ?? 0;
    }
    if (sum > best_opportunity) {
      best_opportunity = sum;
      best_sequence = key;
    }
  }
  console.log(best_sequence, best_opportunity);
  return best_opportunity;
};

export const main = (): void => {
  console.log("Example 1:", solve_1(example1));
  console.log("Solution 1:", solve_1(input));
  console.log("Example 2:", solve_2(example2));
  console.log("Solution 2:", solve_2(input));
};
