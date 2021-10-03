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
import delay from "delay";

export const TILE_SIZE = 10 * PHYSICS_SCALE;
export const SPRITE_TILE_SIZE = 10;
export const SPRITE_TILE_GRID = 16;
export const SPRITE_TILE_OFFSET = (SPRITE_TILE_GRID - SPRITE_TILE_SIZE) / 2;

const BASE_FONT_SIZE = 8;
const FONT_SCALE = 3;
const FONT_SIZE = FONT_SCALE * BASE_FONT_SIZE;
const FONT_NAME = `${FONT_SIZE}px Babyblocks`;

const HINTS: {[key: string]: string} = {
    'intro': `Ooh, a bone! Let's get it!\n\nArrow keys or WASD to move\nSpace or Z to jump`,
    'dogs-on-head': `Hm. This one is too high to jump to...`,
    'double-jump': `With a dog on your head, jump in midair to do a double jump`,
    'select-a-dog': `Press up and down to change which dog you'll be when you split off`,
    'multibone': `Ooh! More bones! We have to get them ALL!\n\nPress R to reset`,
    'getting-stuck': `If I'm alone and I get a bone, I'm not moving!\nYou'll have to reset the level with R.`,
    'unstable': `Turns out a tower of dogs is pretty unstable...`,
    'move-tower': `So many dogs! This must be the last level!`,
    'win': `You win!\nWelcome to the dog playground!`,
};

export enum Tile {
    AIR,
    GROUND,
}

// Calculated by hand.
const tilePositions = [
    { x: 1, y: 0 },
    { x: 5, y: 1 },
    { x: 4, y: 1 },
    { x: 6, y: 0 },
    { x: 6, y: 1 },
    { x: 0, y: 1 },
    { x: 2, y: 1 },
    { x: 3, y: 0 },
    { x: 7, y: 1 },
    { x: 1, y: 1 },
    { x: 3, y: 1 },
    { x: 5, y: 0 },
    { x: 7, y: 0 },
    { x: 2, y: 0 },
    { x: 4, y: 0 },
    { x: 0, y: 0 },
];

export class Level {
    game: Game;
    imageName: string;

    entities: Entity[] = [];
    tiles: Tile[][] = [];

    done = false;
    won = false;

    constructor(game: Game, imageName: string) {
        this.game = game;
        this.imageName = imageName;

        const image = Images.images[imageName].image!
        this.initFromImage(image);
    }

    initFromImage(image: HTMLImageElement): void {
        this.entities = [];
        this.tiles = [];

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

        let addedPlayer = false;

        for (let y = 0; y < image.height; y++) {
            for (let x = 0; x < image.width; x++) {
                const colorString = pixelColorString(context, x, y);

                if (colorString == "000000") {
                    this.tiles[y][x] = Tile.GROUND;
                } else if (
                    colorString.startsWith("ff00") ||
                    colorString.startsWith("ff70")
                ) {
                    const dog = new Dog(this);
                    dog.midX = x * TILE_SIZE + 0.5 * (TILE_SIZE - 1);
                    dog.maxY = y * TILE_SIZE + 1 * (TILE_SIZE - 1);
                    dog.controller = new StandController();
                    this.entities.push(dog);

                    if (colorString.startsWith("ff70")) {
                        addedPlayer = true;
                        dog.controller = new PlayerController();
                    }
                } else if (colorString == "ffff00") {
                    const bone = new Bone(this);
                    bone.midX = x * TILE_SIZE + 0.5 * (TILE_SIZE - 1);
                    bone.midY = y * TILE_SIZE + 0.5 * (TILE_SIZE - 1);
                    this.entities.push(bone);
                }
            }
        }

        if (!addedPlayer) {
            console.log("No player!");
        }
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
        return this.entities.filter((ent) => ent instanceof clazz) as T[];
    }

    getTile(x: number, y: number) {
        if (x < 0) {
            x = 0;
        }
        if (y < 0) {
            y = 0;
        }
        if (x >= this.width) {
            x = this.width - 1;
        }
        if (y >= this.height) {
            y = this.height - 1;
        }
        return this.tiles[y][x];
    }

    update(dt: number): void {
        const startBones = this.numBones();

        for (const entity of this.entities) {
            entity.update(dt);
        }

        for (let i = this.entities.length - 1; i >= 0; i--) {
            const entity = this.entities[i];
            if (entity.done) {
                this.entities.splice(i, 1);
            }
        }

        const endBones = this.numBones();

        if (startBones > 0 && endBones == 0) {
            this.won = true;
            delay(1000).then(() => (this.done = true));
        }
    }

    render(context: CanvasRenderingContext2D): void {
        this.renderBG(context);

        this.renderTiles(context);

        for (const entity of this.entities) {
            entity.render(context);
        }

        const hint = HINTS[this.imageName];
        if (hint) {
            this.renderText(context, hint);
        }
    }

    renderBG(context: CanvasRenderingContext2D): void {
        context.save();

        context.resetTransform();
        context.fillStyle = "#3b7d6e";
        context.fillRect(0, 0, context.canvas.width, context.canvas.height);

        this.game.camera.applyToContext(context, 0.5);

        const image = Images.images["trees"].image!;

        context.drawImage(
            image,
            (0.5 * this.width * TILE_SIZE) / 2 -
                (image.width * PHYSICS_SCALE) / 2,
            (0.5 * this.height * TILE_SIZE) / 2 -
                (image.height * PHYSICS_SCALE) / 2,
            image.width * PHYSICS_SCALE,
            image.height * PHYSICS_SCALE
        );

        context.restore();
    }

    renderTiles(context: CanvasRenderingContext2D) {
        const extraTiles = 15;
        // Bottom up
        for (let y = this.height + extraTiles; y >= -extraTiles; y--) {
            // TODO: Some rendering optimization

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
            SPRITE_TILE_GRID * PHYSICS_SCALE + 1
        );
    }

    renderText(context: CanvasRenderingContext2D, text: string) {
        const fontFg = "#c7cfdd";
        const fontBg = "#2a2f4e";

        context.save();

        context.resetTransform();

        context.font = FONT_NAME;
        context.textBaseline = "top";
        context.textAlign = "center";
        context.fillStyle = fontBg;

        const x = context.canvas.width / 2;
        const y = 2 * FONT_SCALE;

        const offsets = [
            { x: -1, y: 0 },
            { x: 1, y: 0 },
            { x: 0, y: 1 },
            { x: 0, y: -1 },
            { x: -1, y: -1 },
            { x: -1, y: 1 },
            { x: 1, y: -1 },
            { x: 1, y: 1 },
        ];
        for (const offset of offsets) {
            renderMultiLine(
                context,
                text,
                x + FONT_SCALE * offset.x,
                y + FONT_SCALE * offset.y
            );
        }

        context.fillStyle = fontFg;
        renderMultiLine(
            context, text, x, y);

        context.restore();
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

function renderMultiLine(context: CanvasRenderingContext2D, text: string, x: number, y: number) {
    const textSplit = text.split('\n');
    const lineHeight = FONT_SIZE;
    for (let i = 0; i < textSplit.length; i++) {
        context.fillText(textSplit[i], x, y + i * lineHeight);
    }
}