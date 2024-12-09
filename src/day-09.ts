const example: string = "data/example-09.txt";
const input: string = "data/input-09.txt";

import fs from "fs";

type DiskMapEntry = {
  id?: number;
  length: number;
};

class DiskMap extends Array<DiskMapEntry> {
  constructor(file?: string) {
    super();
    if (typeof file !== "string") {
      return;
    }
    let is_file: boolean = true;
    let id: number = 0;

    fs.readFileSync(file, "utf-8")
      .split(/\r?\n/)
      .join("")
      .split("")
      .forEach((c: string) => {
        const length: number = parseInt(c);
        if (is_file) {
          if (length) {
            this.push({ id, length });
          }
          ++id;
        } else if (length) {
          this.push({ length });
        }
        is_file = !is_file;
      });
  }

  defrag(): DiskMap {
    const copy: DiskMap = this.slice() as DiskMap;
    const map: DiskMap = new DiskMap();
    let front: DiskMapEntry | undefined;
    while ((front = copy.shift())) {
      if (front.id !== undefined) {
        map.push(front);
        continue;
      }

      let gap = front.length;
      while (gap > 0 && copy.length > 0) {
        const last = copy[copy.length - 1];
        const nid = last.id;
        if (nid == undefined) {
          copy.pop();
          continue;
        }
        if (copy.length === 1) {
          map.push({ id: nid, length: last.length });
          copy.pop();
          gap = 0;
          break;
        }

        const to_move = Math.min(gap, last.length);
        if (map[map.length - 1].id !== nid) {
          map.push({ id: nid, length: to_move });
        } else {
          map[map.length - 1].length += to_move;
        }

        if (last.length > gap) {
          last.length -= gap;
          gap = 0;
        } else {
          copy.pop();
          gap -= to_move;
        }
      }
      if (gap > 0) {
        map.push({ length: gap });
      }
    }
    return map;
  }

  defrag_weird(): DiskMap {
    const map: DiskMap = this.slice() as DiskMap;

    for (let i = map.length - 1; i > 0; --i) {
      const candidate = map[i];
      if (candidate.id === undefined) {
        continue;
      }
      let moved = false;
      for (let j = 0; j < i; ++j) {
        const target = map[j];
        if (
          target.id === candidate.id &&
          j < map.length - 2 &&
          map[j + 1].id === undefined &&
          map[j + 1].length <= candidate.length
        ) {
          map[j + 1].length -= candidate.length;
          target.length += candidate.length;
          if (map[j + 1].length === 0) {
            map.splice(j + 1, 1);
            --i;
          }
          map.splice(i, 1);
          moved = true;
          break;
        }
        if (target.id === undefined && target.length >= candidate.length) {
          target.length -= candidate.length;
          if (target.length === 0) {
            target.id = candidate.id;
            target.length = candidate.length;
          } else {
            map.splice(j, 0, {
              id: candidate.id,
              length: candidate.length,
            });
            ++i;
          }
          moved = true;
          break;
        }
      }
      if (moved) {
        candidate.id = undefined;

        // Consolidate space
        if (i > 0 && map[i - 1].id === undefined) {
          map[i - 1].length += map[i].length;
          map.splice(i, 1);
          --i;
        }
        if (i < map.length - 1 && map[i + 1].id === undefined) {
          map[i].length += map[i + 1].length;
          map.splice(i + 1, 1);
        }
      }
    }

    return map;
  }

  checksum(): number {
    let sum: number = 0;
    let i = 0;
    this.forEach((entry: DiskMapEntry) => {
      for (let j = 0; j < entry.length; ++j) {
        sum += i++ * (entry.id ?? 0);
      }
    });
    return sum;
  }
}

const solve_1 = (file: string): number => {
  return new DiskMap(file).defrag().checksum();
};

const solve_2 = (file: string): number => {
  return new DiskMap(file).defrag_weird().checksum();
};

export const main = (): void => {
  console.log("Example 1:", solve_1(example));
  console.log("Solution 1:", solve_1(input));
  console.log("Example 2:", solve_2(example));
  console.log("Solution 2:", solve_2(input));
};
