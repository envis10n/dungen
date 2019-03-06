// Cellular Automata demo.

import { CellularAutomata } from "./classes/cellular_automata";

const cells = new CellularAutomata({width: 60, height: 60, startAlive: 0.5, lifetime: 10});
(async () => {
    await cells.init();
    cells.simulate(100);
    const res: boolean[][] = [];
    for (let y = 0; y < cells.height; y++) {
        const r: boolean[] = [];
        for (let x = 0; x < cells.width; x++) {
            const cell = cells.getTile(x, y);
            if (cell) {
                r.push(cell.state);
            }
        }
        res.push(r);
    }
    const layer2 = new CellularAutomata({width: 60, height: 60, startAlive: 0.4});
    await layer2.init();
    layer2.simulate(20);
    const res2: boolean[][] = [];
    for (let y = 0; y < layer2.height; y++) {
        const r: boolean[] = [];
        for (let x = 0; x < layer2.width; x++) {
            const cell = layer2.getTile(x, y);
            if (cell) {
                r.push(cell.state);
            }
        }
        res2.push(r);
    }
    const res3: string[][] = res.map((e) => e.map((r) => r ? "**" : "  "));
    const fin: string[] = [];
    for (let i = 0; i < res2.length; i++) {
        const line = res3[i];
        for (let ix = 0; ix < line.length; ix++) {
            if (line[ix] === "  " && res2[i][ix] === true) {
                line[ix] = "##";
            }
        }
        fin.push(line.join(""));
    }
    console.log(fin.join("\n"));
})();
