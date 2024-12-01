import process from "node:process";

const main = async () => {
  const argv = process.argv;
  console.log(argv);
  if (argv.length < 3) {
    console.error("Missing day as command line argument!");
    return;
  }

  let file = argv[2];
  if (file.startsWith("day-")) {
    file = file.slice(4);
  }
  if (file.endsWith(".ts")) {
    file = file.slice(0, -3);
  }

  const script = await import(`./day-${file}.js`);
  process.exitCode = script.main(argv.slice(3));
};

main();
