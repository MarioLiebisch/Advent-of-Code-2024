const example: string = "data/example-21.txt";
const input: string = "data/input-21.txt";

import fs from "fs";

// Could make it more dynamic and generate it on the fly,
// but static will do for now.
// Considerations/observations:
// Getting to the far left first is most important to
// avoid extra back and forth.
// Down takes precedence over right (?).
// Only break these to avoid illegal moves.
// Always repeat directions whenever possible.
const moves_numeric: { [key: string]: string } = {
  "A:0": "<",
  "A:1": "^<<",
  "A:2": "<^",
  "A:3": "^",
  "A:4": "^^<<",
  "A:5": "<^^",
  "A:6": "^^",
  "A:7": "^^^<<",
  "A:8": "<^^^",
  "A:9": "^^^",
  "A:A": "",
  "0:0": "",
  "0:1": "^<",
  "0:2": "^",
  "0:3": "^>",
  "0:4": "^^<",
  "0:5": "^^",
  "0:6": "^^>",
  "0:7": "^^^<",
  "0:8": "^^^",
  "0:9": "^^^>",
  "1:0": ">v",
  "1:1": "",
  "1:2": ">",
  "1:3": ">>",
  "1:4": "^",
  "1:5": "^>",
  "1:6": "^>>",
  "1:7": "^^",
  "1:8": "^^>",
  "1:9": "^^>>",
  "2:0": "v",
  "2:1": "<",
  "2:2": "",
  "2:3": ">",
  "2:4": "<^",
  "2:5": "^",
  "2:6": "^>",
  "2:7": "<^^",
  "2:8": "^^",
  "2:9": "^^>",
  "3:0": "<v",
  "3:1": "<<",
  "3:2": "<",
  "3:3": "",
  "3:4": "<<^",
  "3:5": "<^",
  "3:6": "^",
  "3:7": "<<^^",
  "3:8": "<^^",
  "3:9": "^^",
  "4:0": ">vv",
  "4:1": "v",
  "4:2": "v>",
  "4:3": "v>>",
  "4:4": "",
  "4:5": ">",
  "4:6": ">>",
  "4:7": "^",
  "4:8": "^>",
  "4:9": "^>>",
  "5:0": "vv",
  "5:1": "<v",
  "5:2": "v",
  "5:3": "v>",
  "5:4": "<",
  "5:5": "",
  "5:6": ">",
  "5:7": "<^",
  "5:8": "^",
  "5:9": "^>",
  "6:0": "<vv",
  "6:1": "<<v",
  "6:2": "<v",
  "6:3": "v",
  "6:4": "<<",
  "6:5": "<",
  "6:6": "",
  "6:7": "<<^",
  "6:8": "<^",
  "6:9": "^",
  "7:0": ">vvv",
  "7:1": "vv",
  "7:2": "vv>",
  "7:3": "vv>>",
  "7:4": "v",
  "7:5": "v>",
  "7:6": "v>>",
  "7:7": "",
  "7:8": ">",
  "7:9": ">>",
  "8:0": "vvv",
  "8:1": "<vv",
  "8:2": "vv",
  "8:3": "vv>",
  "8:4": "<v",
  "8:5": "v",
  "8:6": "v>",
  "8:7": "<",
  "8:8": "",
  "8:9": ">",
  "9:0": "<vvv",
  "9:1": "<<vv",
  "9:2": "<vv",
  "9:3": "vv",
  "9:4": "<<v",
  "9:5": "<v",
  "9:6": "v",
  "9:7": "<<",
  "9:8": "<",
  "9:9": "",
  "0:A": ">",
  "1:A": ">>v",
  "2:A": ">v",
  "3:A": "v",
  "4:A": ">>vv",
  "5:A": ">vv",
  "6:A": "vv",
  "7:A": ">>vvv",
  "8:A": ">vvv",
  "9:A": "vvv",
};

const moves_direction: { [key: string]: string } = {
  "A:<": "v<<",
  "A:v": "<v",
  "A:>": "v",
  "A:^": "<",
  "<:<": "",
  "<:v": ">",
  "<:>": ">>",
  "<:^": ">^",
  "v:<": "<",
  "v:v": "",
  "v:>": ">",
  "v:^": "^",
  ">:<": "<<",
  ">:v": "<",
  ">:>": "",
  ">:^": "<^",
  "^:<": "v<",
  "^:v": "v",
  "^:>": "v>",
  "^:^": "",
  "<:A": ">>^",
  "v:A": "^>",
  ">:A": "^",
  "^:A": ">",
  "A:A": "",
};

const press_sequence = (
  sequence: string,
  moves: { [key: string]: string },
): string => {
  let res = "";
  let pos = "A";
  for (let i = 0; i < sequence.length; i++) {
    const key = pos + ":" + sequence[i];
    pos = sequence[i];
    const movement = moves[key];
    if (movement === undefined) {
      console.error("Missing:", key);
      return "";
    }
    res += movement + "A";
  }
  return res;
};

const press_sequence2 = (
  sequence: { [key: string]: number },
  moves: { [key: string]: string },
): { [key: string]: number } => {
  const res: { [key: string]: number } = {};
  for (const [part, count] of Object.entries(sequence)) {
    const new_parts = press_sequence(part, moves)
      .replace(/A$/, "")
      .split("A")
      .map((p) => p + "A");
    for (const new_part of new_parts) {
      if (res[new_part] === undefined) {
        res[new_part] = count;
      } else {
        res[new_part] += count;
      }
    }
  }
  return res;
};

const solve_1 = (file: string): number => {
  const sequences: string[] = fs
    .readFileSync(file, "utf-8")
    .split(/\r?\n/)
    .filter((line) => line.length > 0);
  let res = 0;
  for (const sequence of sequences) {
    const depressured_sequence = press_sequence2(
      {
        [sequence]: 1,
      },
      moves_numeric,
    );
    const radiated_sequence = press_sequence2(
      depressured_sequence,
      moves_direction,
    );
    const frozen_sequence = press_sequence2(radiated_sequence, moves_direction);
    // res += frozen_sequence.length * parseInt(sequence, 10);
    let length: number = 0;
    for (const [part, count] of Object.entries(frozen_sequence)) {
      length += part.length * count;
    }
    res += length * parseInt(sequence, 10);
  }
  return res;
};

const solve_2 = (file: string): number => {
  const sequences: string[] = fs
    .readFileSync(file, "utf-8")
    .split(/\r?\n/)
    .filter((line) => line.length > 0);
  let res = 0;

  for (const sequence of sequences) {
    let robot_sequence = press_sequence2({ [sequence]: 1 }, moves_numeric);
    for (let i = 0; i < 25; i++) {
      robot_sequence = press_sequence2(robot_sequence, moves_direction);
    }
    let length: number = 0;
    for (const [part, count] of Object.entries(robot_sequence)) {
      length += part.length * count;
    }
    res += length * parseInt(sequence, 10);
  }
  return res;
};

export const main = (): void => {
  console.log("Example 1:", solve_1(example));
  console.log("Solution 1:", solve_1(input));
  // console.log("Example 2:", solve_2(example));
  console.log("Solution 2:", solve_2(input));
};
