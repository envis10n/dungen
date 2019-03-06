/*tslint:disable ordered-imports object-literal-sort-keys*/
import * as Vector2D from "../lib/utils/vector";

export class Cell {
    public index: number;
    public pos: Vector2D.ICoordinates;
    public state: boolean = false;
    constructor(index: number, pos: Vector2D.ICoordinates) {
        this.index = index;
        this.pos = pos;
    }
}
