export interface ICoordinates {
    x: number;
    y: number;
}
export function length(a: ICoordinates, b: ICoordinates): number {
    return Math.sqrt((Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2)));
}
export function to_1d(coords: ICoordinates, width: number): number {
    return coords.x + width * coords.y;
}
export function from_1d(i: number, width: number): ICoordinates {
    return {
        x: i % width,
        y: Math.floor(i / width),
    };
}
export function manhattanDistance(pos: ICoordinates, dest: ICoordinates): number {
    return Math.abs(pos.x - dest.x) + Math.abs(pos.y - dest.y);
}
