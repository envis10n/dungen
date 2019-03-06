/*tslint:disable ordered-imports max-classes-per-file object-literal-sort-keys*/
import * as Vector2D from "../lib/utils/vector";
import * as Maths from "../lib/utils/math";

export class Cell {
    public index: number;
    public pos: Vector2D.ICoordinates;
    public state: boolean = false;
    constructor(index: number, pos: Vector2D.ICoordinates) {
        this.index = index;
        this.pos = pos;
    }
}

export interface ICellularAutomataOptions {
    width?: number;
    height?: number;
    startAlive?: number;
    deathLimit?: number;
    birthLimit?: number;
    overPop?: number;
    lifetime?: number;
    state?: Cell[];
}

export class CellularAutomata {
    public width: number;
    public height: number;
    public startAlive: number;
    public deathLimit: number;
    public birthLimit: number;
    public overPop: number;
    public lifetime: number;
    public map: Cell[];
    constructor(opts: ICellularAutomataOptions = {}) {
        this.width = opts.width || 100;
        this.height = opts.height || 100;
        this.startAlive = opts.startAlive || 0.8;
        this.deathLimit = opts.deathLimit || 1;
        this.birthLimit = opts.birthLimit || 3;
        this.overPop = opts.overPop || 4;
        this.lifetime = opts.lifetime || 5;
        this.map = opts.state || new Array(this.width * this.height);
    }
    public async init() {
        for (let i = 0; i < this.width * this.height; i++) {
            const cell = new Cell(i, Vector2D.from_1d(i, this.width));
            if ((await Maths.srand()) <= this.startAlive) { cell.state = true; }
            this.map[i] = cell;
        }
    }
    public countAliveNeighbors(idx: number): number {
        let c = 0;
        const {x, y} = Vector2D.from_1d(idx, this.width);
        for (let i = -1; i < 2; i++) {
            for (let j = -1; j < 2; j++) {
                let nx = x + i;
                let ny = y + j;
                if (i !== 0 && j !== 0) {
                    if (nx < 0 || ny < 0 || nx >= this.width || ny >= this.height) {
                        if (nx < 0) { nx = this.width - 1; }
                        if (ny < 0) { ny = this.height - 1; }
                        if (nx >= this.width) { nx = 0; }
                        if (ny >= this.height) { ny = 0; }
                    }
                    if (this.map[Vector2D.to_1d({x: nx, y: ny}, this.width)].state === true) { c += 1; }
                }
            }
        }
        return c;
    }
    public getTile(x: number, y: number): Cell {
        let idx = Vector2D.to_1d({x, y}, this.width);
        if (idx >= this.map.length) { idx = 0; }
        if (idx < 0) { idx = this.map.length - 1; }
        return this.map[idx];
    }
    public getNeighbors(idx: number): Cell[] {
        const {x, y} = Vector2D.from_1d(idx, this.width);
        const t: Cell[] = [];
        if (x + 1 < this.width) { t.push(this.map[Vector2D.to_1d({x: x + 1, y}, this.width)]); }
        if (x - 1 >= 0) { t.push(this.map[Vector2D.to_1d({x: x - 1, y}, this.width)]); }
        if (y + 1 < this.height) { t.push(this.map[Vector2D.to_1d({x, y: y + 1}, this.width)]); }
        if (y - 1 >= 0) { t.push(this.map[Vector2D.to_1d({x, y: y - 1}, this.width)]); }
        return t;
    }
    public getWalkableNeighbors(idx: number): Cell[] {
        const neighbors: Cell[] = this.getNeighbors(idx);
        return neighbors.filter((cell) => cell.state === false);
    }
    public getAlivePercent(): number {
        return this.map.filter((cell) => cell.state === true).length / this.map.length;
    }
    public simulate(rounds: number = 1) {
        for (let r = 0; r < rounds; r++) {
            const nMap: Cell[] = [];
            for (let i = 0; i < this.width * this.height; i++) {
                const nbs = this.countAliveNeighbors(i);
                nMap[i] = new Cell(i, Vector2D.from_1d(i, this.width));
                if (this.map[i].state === true && nbs < 2) {
                    nMap[i].state = false;
                } else if (this.map[i].state === true && nbs > 3) {
                    nMap[i].state = false;
                } else if (this.map[i].state === false && nbs === 3) {
                    nMap[i].state = true;
                } else {
                    nMap[i].state = this.map[i].state;
                }
            }
            this.map = nMap;
        }
    }
}
