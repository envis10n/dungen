import * as Vector2D from '../lib/utils/vector';
import * as Maths from '../lib/utils/math';

export class Cell {
    index: number;
    pos: Vector2D.Coordinates;
    state: boolean = false;
    constructor(index: number, pos: Vector2D.Coordinates) {
        this.index = index;
        this.pos = pos;
    }
}

export interface CellularAutomataOptions {
    width?: number;
    height?: number;
    startAlive?: number;
    deathLimit?: number;
    birthLimit?: number;
    overPop?: number;
    lifetime?: number;
}

export class CellularAutomata {
    width: number;
    height: number;
    startAlive: number;
    deathLimit: number;
    birthLimit: number;
    overPop: number;
    lifetime: number;
    map: Array<Cell>;
    constructor(opts: CellularAutomataOptions = {}){
        const dopts: CellularAutomataOptions = {width: 100, height: 100, startAlive: 0.8, deathLimit: 1, birthLimit: 3, overPop: 4, lifetime: 5};
        this.width = opts.width || 100;
        this.height = opts.height || 100;
        this.startAlive = opts.startAlive || 0.8;
        this.deathLimit = opts.deathLimit || 1;
        this.birthLimit = opts.birthLimit || 3;
        this.overPop = opts.overPop || 4;
        this.lifetime = opts.lifetime || 5;
        this.map = new Array(this.width * this.height);
    }
    async init() {
        for(var i = 0; i < this.width * this.height; i++){
            let cell = new Cell(i, Vector2D.from_1d(i, this.width));
            if((await Maths.srand()) <= this.startAlive) cell.state = true;
            this.map[i] = cell;
        }
    }
    countAliveNeighbors(idx: number): number {
        let c = 0;
        let {x, y} = Vector2D.from_1d(idx, this.width);
        for(let i = -1; i < 2; i++) {
            for(var j = -1; j < 2; j++) {
                let nx = x+i;
                let ny = y+j;
                if(i !== 0 && j !== 0) {
                    if(nx < 0 || ny < 0 || nx >= this.width || ny >= this.height) {
                        if(nx < 0) nx = this.width-1;
                        if(ny < 0) ny = this.height-1;
                        if(nx >= this.width) nx = 0;
                        if(ny >= this.height) ny = 0;
                    }
                    if(this.map[Vector2D.to_1d({x: nx, y: ny}, this.width)].state == true) {
                        c += 1;
                    }
                }
            }
        }
        return c;
    }
    getTile(x: number, y: number): Cell {
        let idx = Vector2D.to_1d({x, y}, this.width);
        if(idx >= this.map.length) idx = 0;
        if(idx < 0) idx = this.map.length - 1;
        return this.map[idx];
    }
    getNeighbors(idx: number): Cell[] {
        let {x, y} = Vector2D.from_1d(idx, this.width);
        let t: Cell[] = [];
        if(x+1 < this.width) t.push(this.map[Vector2D.to_1d({x: x+1, y}, this.width)]);
        if(x-1 >= 0) t.push(this.map[Vector2D.to_1d({x: x-1, y}, this.width)]);
        if(y+1 < this.height) t.push(this.map[Vector2D.to_1d({x, y: y+1}, this.width)]);
        if(y-1 >= 0) t.push(this.map[Vector2D.to_1d({x, y: y-1}, this.width)]);
        return t;
    }
    getWalkableNeighbors(idx: number): Cell[] {
        let neighbors: Cell[] = this.getNeighbors(idx);
        return neighbors.filter(cell=>cell.state == false);
    }
    getAlivePercent(): number {
        return this.map.filter(cell => cell.state == true).length / this.map.length;
    }
    simulate(rounds: number = 1) {
        for(let r = 0; r < rounds; r++) {
            let nMap: Cell[] = [];
            for(var i = 0; i < this.width * this.height; i++){
                let nbs = this.countAliveNeighbors(i);
                nMap[i] = new Cell(i, Vector2D.from_1d(i, this.width));
                if(this.map[i].state == true && nbs < 2) {
                    nMap[i].state = false;
                } else if(this.map[i].state == true && nbs > 3) {
                    nMap[i].state = false;
                } else if(this.map[i].state == false && nbs == 3) {
                    nMap[i].state = true;
                } else {
                    nMap[i].state = this.map[i].state;
                }
            }
            this.map = nMap;
        }
    }
}