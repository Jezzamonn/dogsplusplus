import { lerp } from "../util";
import { physFromPixelArt, rng } from "./constants";
import { Entity } from "./entity/entity";
import { Player } from "./entity/player";
import { Game } from "./game";

export enum Tile {
    AIR,
    GROUND,
}

export class Level {

    game: Game;

    entities: Entity[] = [];
    tiles: Tile[][] = [];

    constructor(game: Game) {
        this.game = game;

        for (let i = 0; i < 20; i++) {
            const ent = new Player(this);
            ent.x = lerp(0, 100, rng());
            ent.y = lerp(0, 100, rng());
            ent.w = physFromPixelArt(5);
            ent.h = physFromPixelArt(5);
            this.entities.push(ent);
        }
    }

    update(dt: number): void {
        for (const entity of this.entities) {
            entity.update(dt);
        }
    }

    render(context: CanvasRenderingContext2D): void {
        for (const entity of this.entities) {
            entity.render(context);
        }
    }

}