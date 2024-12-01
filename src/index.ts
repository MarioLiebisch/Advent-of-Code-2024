import process from 'node:process';


const main = async () => {
    const argv = process.argv;
    if (argv.length < 3) {
        console.error('Missing day number as command line argument!');
        return;
    }
    const script = await import(`./day-${argv[2].padStart(2, '0')}.js`);
    process.exitCode = script.main(argv.slice(3));
};

main();
