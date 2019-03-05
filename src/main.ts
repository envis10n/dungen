import Utils from './lib/utils';

// Cellular Automata demo.
import { CellularAutomata, Cell } from './classes/cell';

let cells = new CellularAutomata({width: 60, height: 60, startAlive: 0.5, lifetime: 10});
(async () => {
    await cells.init();
    cells.simulate(100);
    let res: string[] = [];
    for(let y = 0; y < cells.height; y++){
        let r: string[] = [];
        for(let x = 0; x < cells.width; x++){
            let cell = cells.getTile(x, y);
            if(cell) {
                if(cell.state === true) {
                    r.push('##');
                } else {
                    r.push('  ');
                }
            }
        }
        res.push(r.join(''));
    }

    console.log(res.join('\n'));
})();