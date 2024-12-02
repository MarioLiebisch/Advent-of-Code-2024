const example: string = "data/example-02.txt";
const input: string = "data/input-02.txt";

import fs from "fs";

type Level = number;
type Report = Level[];
type Reports = Report[];

const read_reports = (file: string): Reports => {
  const res: Reports = [];

  for (const line of fs
    .readFileSync(file, "utf-8")
    .split(/(\r?\n)+/)
    .filter((line) => line?.length > 0 && line != "\n")) {
    res.push(line.split(" ").map((x) => parseInt(x)));
  }

  return res;
};

const verify_report = (report: Report, dampener: boolean = false): boolean => {
  let status = 0;
  for (let i = 0; i < report.length - 1; ) {
    const d = report[i + 1] - report[i];
    if (
      d == 0 ||
      d < -3 ||
      d > 3 ||
      (status != 0 && Math.sign(d) !== Math.sign(status))
    ) {
      if (dampener) {
        // Up to 3 consecutive values with any potential error
        const tries = [
          report.slice(0, i).concat(report.slice(i + 1)),
          report.slice(0, i + 1).concat(report.slice(i + 2)),
        ];
        if (i > 0) {
          tries.push(report.slice(0, i - 1).concat(report.slice(i)));
        }
        return tries.some((try_report) => verify_report(try_report));
      }
      return false;
    }
    status = Math.sign(d);
    i++;
  }
  return true;
};

const solve_1 = (file: string): number => {
  const reports = read_reports(file);
  let safe_count = 0;
  for (const report of reports) {
    if (verify_report(report)) {
      safe_count++;
    }
  }
  return safe_count;
};

const solve_2 = (file: string): number => {
  const reports = read_reports(file);
  let safe_count = 0;
  for (const report of reports) {
    if (verify_report(report, true)) {
      safe_count++;
    }
  }
  return safe_count;
};

export const main = (): void => {
  console.log("Example 1:", solve_1(example));
  console.log("Solution 1:", solve_1(input));
  console.log("Example 2:", solve_2(example));
  console.log("Solution 2:", solve_2(input));
};
