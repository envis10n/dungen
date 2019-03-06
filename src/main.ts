/* tslint:disable ordered-imports object-literal-sort-keys */
// Cellular Automata demo.

import { ArgumentParser } from "argparse";
import { CellularAutomata } from "./classes/cellular_automata";
import fs from "fs";
import path from "path";
import { promisify as _p } from "util";
const writeFile = _p(fs.writeFile);

declare interface IArgs {
    width: number;
    length: number;
    file: string;
    iterations: number;
}

const parser = new ArgumentParser({
    addHelp: true,
    version: "0.0.1",
});

parser.addArgument(["-f", "--file"], {
    help: "File path for exporting room data.",
});

parser.addArgument(["-i", "--iterations"], {
    help: "Simulation iterations. Default: 15",
});

parser.addArgument(["-w", "--width"], {
    help: "Width of cell map (X axis). Default: 25",
});

parser.addArgument(["-l", "--length"], {
    help: "Height of cell map (Y axis). Default: 25",
});

const args: IArgs = parser.parseArgs();

if (args.file === null) { args.file = ""; }
if (args.length === null) { args.length = 25; }
if (args.width === null) { args.width = 25; }
if (args.iterations === null) { args.iterations = 15; }

(async () => {
    console.log("Creating cell map...");
    const cells = new CellularAutomata({
        width: args.width,
        height: args.length,
    });
    console.log("Initializing cell states...");
    await cells.init();
    console.log("Simulating...");
    cells.simulate(args.iterations);
    console.log("Converting room data to yaml...");
    const rooms = cells.export().map((room) => room.toYaml((args.width - 1) / 2, (args.length - 1) / 2)).join("\n\n");
    console.log("Done.");
    if (args.file !== "") {
        // File flag exists.
        let filePath = args.file;
        if (!path.isAbsolute(filePath)) { filePath = path.join(process.cwd(), filePath); }
        try {
            console.log("Exporting...");
            await writeFile(filePath, rooms);
            console.log(`Exported file data to: ${filePath}`);
        } catch (e) {
            console.error(e);
        }
    } else {
        console.log("=Room Data=\n\n");
        console.log(rooms);
    }
})();
