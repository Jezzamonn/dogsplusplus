import { lerp } from "../util";
import { physFromPx, PHYSICS_SCALE, Point, rng } from "./constants";
import { PlayerController } from "./controller/player-controller";
import { RandomController } from "./controller/random-controller";
import { StandController } from "./controller/stand-controller";
import { Dog } from "./entity/dog";
import { Entity } from "./entity/entity";
import { Game } from "./game";
import * as Images from "./../images";
import { Bone } from "./entity/bone";
import delay from 'delay';

export const TILE_SIZE = 10 * PHYSICS_SCALE;
export const SPRITE_TILE_SIZE = 10;
export const SPRITE_TILE_GRID = 16;
export const SPRITE_TILE_OFFSET = (SPRITE_TILE_GRID - SPRITE_TILE_SIZE) / 2;

export enum Tile {
    AIR,
    GROUND,
}

// Calculated by hand.
const tilePositions = [
    {x: 1, y: 0},
    {x: 5, y: 1},
    {x: 4, y: 1},
    {x: 6, y: 0},
    {x: 6, y: 1},
    {x: 0, y: 1},
    {x: 2, y: 1},
    {x: 3, y: 0},
    {x: 7, y: 1},
    {x: 1, y: 1},
    {x: 3, y: 1},
    {x: 5, y: 0},
    {x: 7, y: 0},
    {x: 2, y: 0},
    {x: 4, y: 0},
    {x: 0, y: 0},
];

export class Level {
    game: Game;
    image: HTMLImageElement;

    entities: Entity[] = [];
    tiles: Tile[][] = [];

    done = false;

    constructor(game: Game, image: HTMLImageElement) {
        this.game = game;
        this.image = image;

        this.initFromImage(this.image);
        this.addInitialEntities();
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

                if (colorString != "ffffff") {
                    this.tiles[y][x] = Tile.GROUND;
                }
            }
        }
    }

    // Mostly debug
    addInitialEntities() {
        for (let i = 0; i < 18; i++) {
            const ent = new Dog(this);
            ent.midX = lerp(1, TILE_SIZE * (this.width - 1), rng());
            ent.maxY = lerp(0, TILE_SIZE * 3, rng());
            ent.controller = new RandomController();
            // ent.controller = new StandController();

            this.entities.push(ent);
        }

        const player = new Dog(this);
        player.midX = lerp(0, TILE_SIZE * this.width, rng());
        player.maxY = lerp(0, TILE_SIZE * (this.height - 1), rng());
        player.controller = new PlayerController();

        this.entities.push(player);

        for (let i = 0; i < 2; i++) {
            let x: number;
            let y: number;
            while (true) {
                x = Math.floor(this.width * rng());
                y = Math.floor(this.height * rng());
                if (!isGroundLikeTile(this.getTile(x, y))) {
                    break;
                }
            }

            const bone = new Bone(this);
            bone.midX = (x + 0.5) * TILE_SIZE;
            bone.midY = (y + 0.5) * TILE_SIZE;
            this.entities.push(bone);
        }
    }

    reset() {
        this.done = false;
        this.entities = [];
        this.tiles = [];
        this.initFromImage(this.image);
        this.addInitialEntities();
    }

    get width() {
        return this.tiles[0].length;
    }

    get height() {
        return this.tiles.length;
    }

    getPlayer() {
        for (const entity of this.entities) {
            if (entity.controller instanceof PlayerController) {
                return entity;
            }
        }
        return undefined;
    }

    numBones() {
        return this.entitiesOfType(Bone).length;
    }

    entitiesOfType<T extends Entity>(clazz: new (...args: any[]) => T): T[] {
        return this.entities.filter(ent => ent instanceof clazz) as T[];
    }

    getTile(x: number, y: number) {
        if (x < 0 || x >= this.width || y >= this.height) {
            return Tile.GROUND;
        }
        if (y < 0) {
            return Tile.AIR;
        }
        return this.tiles[y][x];
    }

    update(dt: number): void {
        const startBones = this.numBones();

        for (const entity of this.entities) {
            entity.update(dt);
        }

        for (let i = this.entities.length-1; i >= 0; i--) {
            const entity = this.entities[i];
            if (entity.done) {
                this.entities.splice(i, 1);
            }
        }

        const endBones = this.numBones();

        if (startBones > 0 && endBones == 0) {
            delay(1000).then(() => this.done = true);
        }
    }

    render(context: CanvasRenderingContext2D): void {
        this.renderBG(context);

        this.renderTiles(context);

        for (const entity of this.entities) {
            entity.render(context);
        }
    }

    renderBG(context: CanvasRenderingContext2D): void {
        context.save();

        context.resetTransform();
        context.fillStyle = '#3b7d6e';
        context.fillRect(0, 0, context.canvas.width, context.canvas.height);

        this.game.camera.applyToContext(context, 0.5);

        const image = Images.images["trees"].image!;

        context.drawImage(
            image,
            0.5 * this.width * TILE_SIZE / 2 - image.width * PHYSICS_SCALE / 2,
            0.5 * this.height * TILE_SIZE / 2 - image.height * PHYSICS_SCALE / 2,
            image.width * PHYSICS_SCALE,
            image.height * PHYSICS_SCALE,
        );

        context.restore();
    }

    renderTiles(context: CanvasRenderingContext2D) {
        const extraTiles = 20;
        // Bottom up
        for (let y = this.height + extraTiles; y >= -extraTiles; y--) {
            for (let x = -extraTiles; x < this.width + extraTiles; x++) {
                const tile = this.getTile(x, y);

                let tilePos = { x: 0, y: 0 };

                if (tile == Tile.AIR) {
                    continue;
                }

                if (tile == Tile.GROUND) {
                    const leftGround = isGroundLikeTile(this.getTile(x - 1, y));
                    const rightGround = isGroundLikeTile(
                        this.getTile(x + 1, y)
                    );
                    const upGround = isGroundLikeTile(this.getTile(x, y - 1));
                    const downGround = isGroundLikeTile(this.getTile(x, y + 1));

                    const tileIndex =
                        (+leftGround << 3) +
                        (+rightGround << 2) +
                        (+upGround << 1) +
                        (+downGround << 0);
                    tilePos = tilePositions[tileIndex];
                }

                this.renderTile(context, { x, y }, tilePos);
            }
        }
    }

    renderTile(
        context: CanvasRenderingContext2D,
        renderPos: Point,
        tilePos: Point
    ) {
        // Very slight aliasing going on, so we +1 the size to avoid it :P
        context.drawImage(
            Images.images["tiles2"].image!,
            SPRITE_TILE_GRID * tilePos.x,
            SPRITE_TILE_GRID * tilePos.y,
            SPRITE_TILE_GRID,
            SPRITE_TILE_GRID,
            TILE_SIZE * renderPos.x - physFromPx(SPRITE_TILE_OFFSET),
            TILE_SIZE * renderPos.y - physFromPx(SPRITE_TILE_OFFSET),
            SPRITE_TILE_GRID * PHYSICS_SCALE + 1,
            SPRITE_TILE_GRID * PHYSICS_SCALE + 1,
        );
    }

    getTileFromCoord(coord: Point) {
        return this.getTile(
            Math.floor(coord.x / TILE_SIZE),
            Math.floor(coord.y / TILE_SIZE)
        );
    }

    getTilePosFromCoord(
        coord: { x?: number; y?: number },
        tilePos: { x?: number; y?: number }
    ): number {
        if (coord.x != null && tilePos.x != null) {
            const tileX = Math.floor(coord.x / TILE_SIZE);
            return tileX * TILE_SIZE + tilePos.x * (TILE_SIZE - 1);
        }
        if (coord.y != null && tilePos.y != null) {
            const tileY = Math.floor(coord.y / TILE_SIZE);
            return tileY * TILE_SIZE + tilePos.y * (TILE_SIZE - 1);
        }
        throw "Invalid input";
    }
}

function pixelColorString(
    context: CanvasRenderingContext2D,
    x: number,
    y: number
): string {
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

function isGroundLikeTile(tile: Tile): boolean {
    return tile == Tile.GROUND;
}
