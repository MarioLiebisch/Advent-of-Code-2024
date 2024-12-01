import process from "node:process";
import fs from "node:fs/promises";

const main = async () => {
  const argv = process.argv;

  if (argv.length < 3) {
    console.error("Missing day as command line argument!");
    return;
  }

  let file = argv[2];
  if (file.match(/^\d+$/)) {
    file = file.padStart(2, "0");
    file = `./day-${file}.js`;
  } else {
    if (file.endsWith(".ts")) {
      file = file.slice(0, -3);
    }
    file = `./${file}.js`;
  }

  try {
    await fs.access(file);
    const script = await import(file);
    process.exitCode = script.main(argv.slice(3));
  } catch {
    console.error(`File ${file} does not exist!`);
    return;
  }
};

main();
