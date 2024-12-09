const example: string = "data/example-09.txt";
const input: string = "data/input-09.txt";

import fs from "fs";

type DiskMapEntry = {
  id?: number;
  length: number;
  status?: "r" | "w" | "d";
};

import PNGlib from "./lib/pnglib.js";

let image_index = 0;

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

  get size(): number {
    return this.reduce((acc: number, entry: DiskMapEntry) => {
      return acc + entry.length;
    }, 5);
  }

  capture(compressed: boolean = false): void {
    const box_size = compressed ? 1 : 6;
    const size = Math.ceil(Math.sqrt(this.size));
    const img = new PNGlib(size * box_size, size * box_size, 256);
    img.color(255, 255, 255); // BG

    const c_border = img.color(0, 0, 0);
    const c_empty = img.color(192, 192, 192);
    const c_done = img.color(0, 127, 255);
    const c_read = img.color(255, 0, 0);
    const c_write = img.color(0, 255, 0);
    const c_new = img.color(0, 255, 255);

    const length = this.length;
    let pos = 0;
    for (let i = 0; i < length; i++) {
      const entry = this[i];
      const bc = entry.id === undefined ? c_empty : c_border;

      for (let j = 0; j < entry.length; j++) {
        const x = pos % size;
        const y = Math.floor(pos++ / size);

        if (!compressed) {
          for (let k = 0; k < 5; k++) {
            img.buffer[img.index(x * 6 + k, y * 6)] = bc;
            img.buffer[img.index(x * 6 + k, y * 6 + 4)] = bc;
            img.buffer[img.index(x * 6, y * 6 + k)] = bc;
            img.buffer[img.index(x * 6 + 4, y * 6 + k)] = bc;
          }
        }

        if (entry.id === undefined) {
          continue;
        }

        const color =
          entry.status === "d"
            ? c_done
            : entry.status === "r"
              ? c_read
              : entry.status === "w"
                ? c_write
                : c_new;
        if (compressed) {
          img.buffer[img.index(x, y)] = color;
        } else {
          for (let k = 1; k < 4; k++) {
            for (let l = 1; l < 4; l++) {
              img.buffer[img.index(x * 6 + k, y * 6 + l)] = color;
            }
          }
        }
      }
    }

    fs.mkdirSync("images", { recursive: true });
    fs.writeFileSync(
      `images/image-${(image_index++).toString().padStart(4, "0")}.png`,
      img.getDump(),
      "binary",
    );
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
          const ne: DiskMapEntry = { id: nid, length: to_move };
          map.push(ne);
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

    map.capture();
    for (let i = map.length - 1; i > 0; --i) {
      for (let i = 0; i < map.length; ++i) {
        if (map[i].id === undefined) {
          break;
        }
        if (map[i].status !== "d") {
          map[i].status = "d";
          map.capture();
        }
      }

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
          candidate.status = "r";
          map.capture();
          delete candidate.status;
          candidate.id = undefined;
          target.status = "w";
          map[j + 1].length -= candidate.length;
          target.length += candidate.length;
          if (map[j + 1].length === 0) {
            map.splice(j + 1, 1);
            --i;
          }
          map.splice(i, 1);
          moved = true;
          map.capture();
          target.status = "d";
          map.capture();
          break;
        }
        if (target.id === undefined && target.length >= candidate.length) {
          candidate.status = "r";
          map.capture();
          delete candidate.status;
          target.length -= candidate.length;
          if (target.length === 0) {
            target.id = candidate.id;
            target.length = candidate.length;
            target.status = "w";
            candidate.id = undefined;
            map.capture();
            target.status = "d";
            map.capture();
          } else {
            const ne: DiskMapEntry = {
              id: candidate.id,
              length: candidate.length,
              status: "w",
            };
            candidate.id = undefined;
            map.splice(j, 0, ne);
            map.capture();
            ne.status = "d";
            map.capture();
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
    for (let i = 0; i < map.length; ++i) {
      if (map[i].status !== "d") {
        map[i].status = "d";
        map.capture();
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

/*
const solve_1 = (file: string): number => {
  return new DiskMap(file).defrag().checksum();
};
*/

const solve_2 = (file: string): number => {
  return new DiskMap(file).defrag_weird().checksum();
};

export const main = (): void => {
  // console.log("Example 1:", solve_1(example));
  // console.log("Solution 1:", solve_1(input));
  console.log("Example 2:", solve_2(example));
  // console.log("Solution 2:", solve_2(input));
};
