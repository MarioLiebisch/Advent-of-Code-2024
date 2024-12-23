const example: string = "data/example-23.txt";
const input: string = "data/input-23.txt";

import fs from "fs";

const solve_1 = (file: string): number => {
  const connections: { [key: string]: string[] } = {};
  fs.readFileSync(file, "utf-8")
    .split(/\r?\n/)
    .filter((line) => line.length > 0)
    .map((line) => {
      const data = line.split("-");
      if (connections[data[0]] === undefined) {
        connections[data[0]] = [];
      }
      if (connections[data[1]] === undefined) {
        connections[data[1]] = [];
      }
      connections[data[0]].push(data[1]);
      connections[data[1]].push(data[0]);
    });
  const groups: Set<string> = new Set();
  Object.keys(connections)
    .filter((computer) => computer[0] === "t") // At least one starts with "t"
    .filter((computer) => connections[computer].length > 1) // At least two connections
    .map((c1) => {
      connections[c1]
        .filter((other) => connections[other].length > 1) // At least two connections
        .map((c2) => {
          if (c2 === c1) return;
          connections[c2].filter((c3) => {
            if (c3 === c2) return;
            if (connections[c3].includes(c1)) {
              groups.add([c1, c2, c3].sort().join(","));
            }
          });
        });
    });
  return groups.size;
};

const solve_2 = (file: string): string => {
  const connections: { [key: string]: string[] } = {};
  fs.readFileSync(file, "utf-8")
    .split(/\r?\n/)
    .filter((line) => line.length > 0)
    .map((line) => {
      const data = line.split("-");
      if (connections[data[0]] === undefined) {
        connections[data[0]] = [];
      }
      if (connections[data[1]] === undefined) {
        connections[data[1]] = [];
      }
      connections[data[0]].push(data[1]);
      connections[data[1]].push(data[0]);
    });
  let longest = 0;
  let password = "";
  const computers = Object.keys(connections);

  const bron_kerbosch = (r: string[], p: string[], x: string[]) => {
    if (p.length === 0 && x.length === 0) {
      if (r.length > longest) {
        longest = r.length;
        password = r.sort().join(",");
      }
      return;
    }
    p.map((v) => {
      const new_r = r.concat(v);
      const new_p = p.filter((n) => connections[v].includes(n));
      const new_x = x.filter((n) => connections[v].includes(n));
      bron_kerbosch(new_r, new_p, new_x);
      p = p.filter((n) => n !== v);
      x = x.concat(v);
    });
  };

  bron_kerbosch([], computers, []);
  return password;
};

export const main = (): void => {
  console.log("Example 1:", solve_1(example));
  console.log("Solution 1:", solve_1(input));
  console.log("Example 2:", solve_2(example));
  console.log("Solution 2:", solve_2(input));
};
