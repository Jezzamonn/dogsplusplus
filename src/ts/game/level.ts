import { lerp } from "../util";
import { physFromPixelArt, PHYSICS_SCALE, Point, rng } from "./constants";
import { Entity } from "./entity/entity";
import { Player } from "./entity/player";
import { Game } from "./game";

const TILE_SIZE = 10 * PHYSICS_SCALE;

export enum Tile {
    AIR,
    GROUND,
}

export class Level {
    game: Game;

    entities: Entity[] = [];
    tiles: Tile[][] = [];

    constructor(game: Game, image: HTMLImageElement) {
        this.game = game;

        for (let i = 0; i < 20; i++) {
            const ent = new Player(this);
            ent.x = lerp(0, 100, rng());
            ent.y = lerp(0, 100, rng());
            ent.w = physFromPixelArt(5);
            ent.h = physFromPixelArt(5);
            this.entities.push(ent);
        }

        this.initFromImage(image);
    }

    initFromImage(image: HTMLImageElement): void {
        // Init with empty stuff.
        for (let y = 0; y < image.height; y++) {
            const tileRow: Tile[] = [];
            for (let x = 0; x < image.width; x++) {
                tileRow[x] = Tile.AIR;
            }
            this.tiles.push(tileRow);
        }

        // Gotta draw it to a canvas to get the pixels
        const canvas = document.createElement("canvas");
        canvas.width = image.width;
        canvas.height = image.height;
        const context = canvas.getContext("2d")!;
        context.drawImage(image, 0, 0, image.width, image.height);

        for (let y = 0; y < image.height; y++) {
            for (let x = 0; x < image.width; x++) {
                const colorString = pixelColorString(context, x, y);

                if (colorString != 'ffffff') {
                    this.tiles[y][x] = Tile.GROUND;
                }
            }
        }
    }

    get width() {
        return this.tiles[0].length;
    }

    get height() {
        return this.tiles.length;
    }


    getTile({x, y}: Point) {
        if (y < 0) {
            return Tile.AIR;
        }
        if (x < 0 || x >= this.width || y >= this.height) {
            return Tile.GROUND;
        }
        return this.tiles[y][x];
    }

    update(dt: number): void {
        for (const entity of this.entities) {
            entity.update(dt);
        }
    }

    render(context: CanvasRenderingContext2D): void {
        this.renderTiles(context);

        for (const entity of this.entities) {
            entity.render(context);
        }
    }

    renderTiles(context: CanvasRenderingContext2D) {
        const extraTiles = 8;
        for (let y = -extraTiles; y < this.height + extraTiles; y++) {
            for (let x = -extraTiles; x < this.width + extraTiles; x++) {
                const tile = this.getTile({x, y});

                this.renderTile(context, tile, {x, y})
            }
        }
    }

    renderTile(context: CanvasRenderingContext2D, tile: Tile, renderPos: Point) {
        if (tile == Tile.AIR) {
            return;
        }

        context.fillStyle = '#33984b';
        context.fillRect(TILE_SIZE * renderPos.x, TILE_SIZE * renderPos.y, TILE_SIZE, TILE_SIZE);
    }

    getTileFromCoord(coord: Point) {
        const tileCoord = {
            x: Math.floor(coord.x / TILE_SIZE),
            y: Math.floor(coord.y / TILE_SIZE),
        }
        return this.getTile(tileCoord);
    }

    getTilePosFromCoord(coord: {x?: number, y?: number}, tilePos: {x?: number, y?: number}): number {
        if (coord.x != null && tilePos.x != null) {
            const tileX = Math.floor(coord.x / TILE_SIZE);
            return tileX * TILE_SIZE + tilePos.x * (TILE_SIZE - 1);
        }
        if (coord.y != null && tilePos.y != null) {
            const tileY = Math.floor(coord.y / TILE_SIZE);
            return tileY * TILE_SIZE + tilePos.y * (TILE_SIZE - 1);
        }
        throw 'Invalid input';
    }
}

function pixelColorString(context: CanvasRenderingContext2D, x: number, y: number): string {
    const colorArray = context.getImageData(x, y, 1, 1);
    return Array.from(colorArray.data.slice(0, 3))
        .map((d) => d.toString(16))
        .map((s) => {
            while (s.length < 2) {
                s = "0" + s;
            }
            return s;
        })
        .join("");
}
