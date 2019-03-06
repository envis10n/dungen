/* tslint:disable ordered-imports */
import { ICoordinates } from "../lib/utils/vector";
import { v4 } from "uuid";

export declare type Exit = "north" | "south" | "east" | "west";

export class Room {
    public exits: Exit[] = [];
    public coords: ICoordinates;
    public readonly id: string = v4();
    public title: string = this.id;
    public description: string = `""`;
    constructor(x: number, y: number) {
        this.coords = {x, y};
    }
    public addExit(direction: Exit) {
        if (!this.exits.find((e) => e === direction)) { this.exits.push(direction); }
    }
    public toYaml(offsetX: number = 0, offsetY: number = 0): string {
        const template = `- id: {{id}}
  title: {{title}}
  coordinates: {{coordinates}}
  description: {{description}}`;
        return template
            .replace("{{id}}", this.id)
            .replace("{{title}}", this.title)
            .replace("{{coordinates}}", `[${this.coords.x - offsetX}, ${this.coords.y - offsetY}, 0]`)
            .replace("{{description}}", this.description);
    }
}
