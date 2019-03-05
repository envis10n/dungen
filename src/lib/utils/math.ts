import { Coordinates } from './vector';
import { promisify as _p } from 'util';
import crypto from 'crypto';

export async function srand(): Promise<number> {
    return parseInt((await _p(crypto.randomBytes)(8)).toString('hex'), 16)/18446744073709552000;
}

export function roundm(n: number, m: number): number {
    return Math.floor(((n + m - 1) / m)) * m;
}

export async function randInRange(max: number = 1, min: number = 0): Promise<number> {
    return Math.round((await srand()) * (max - min) + min);
}

export function clamp(val: number, max: number = 1, min: number = 0): number {
    return val > max ? max : val < min ? min : val;
}

export async function getRandomPointInCircle(radius: number, tile: number = 4): Promise<Coordinates> {
    let t = 2 * Math.PI * (await srand());
    let u = (await srand())+(await srand());
    let r: number = 0;
    if (u > 1) r = 2-u;
    else r = u;
    let x = roundm(radius*r*Math.cos(t), tile);
    let y = roundm(radius*r*Math.sin(t), tile);
    return {x, y};
}