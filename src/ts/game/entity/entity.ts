import { Dir, FPS, PHYSICS_SCALE, Point } from "../constants";
import { Controller } from "../controller/controller";
import { Level, Tile } from "../level";

export enum FacingDir {
    LEFT,
    RIGHT,
}

export class Entity {
    level: Level;

    x: number = 0;
    y: number = 0;
    w: number = 0;
    h: number = 0;
    dx: number = 0;
    dy: number = 0;
    canColide = true;
    // This is what the other one did, who knows what works for this game.
    gravity = (1 / 8) * PHYSICS_SCALE * FPS * FPS;
    xDampAmt = (1 / 8) * PHYSICS_SCALE * FPS * FPS;
    facingDir = FacingDir.RIGHT;
    running = false;

    animCount: number = 0;

    controller?: Controller;

    debugColor? = "#f68187";

    constructor(level: Level) {
        this.level = level;
    }

    update(dt: number) {
        this.animCount += dt;

        this.controller?.update(this, dt);

        this.applyGravity(dt);
        this.moveX(this.dx * dt);
        this.moveY(this.dy * dt);
    }

    render(context: CanvasRenderingContext2D) {
        if (this.debugColor == null) {
            return;
        }
        context.fillStyle = this.debugColor;
        context.fillRect(this.x, this.y, this.w, this.h);
    }

    applyGravity(dt: number) {
        this.dy += this.gravity * dt;
    }

    // Stuff for controllers to use:
    moveLeft(dt: number) {}

    moveRight(dt: number) {}

    jump() {}

    dampenX(dt: number) {
        if (this.dx > this.xDampAmt * dt) {
            this.dx -= this.xDampAmt * dt;
        } else if (this.dx < -this.xDampAmt * dt) {
            this.dx += this.xDampAmt * dt;
        } else {
            this.dx = 0;
        }
    }

    moveX(dx: number) {
        this.x = Math.round(this.x + dx);

        if (!this.canColide) {
            return;
        }

        if (dx < 0) {
            // Moving left
            if (this.isTouching(Tile.GROUND, { dir: Dir.LEFT })) {
                this.onLeftCollision();
            }
        } else if (dx > 0) {
            // Moving right
            if (this.isTouching(Tile.GROUND, { dir: Dir.RIGHT })) {
                this.onRightCollision();
            }
        }
    }

    moveY(dy: number) {
        this.y = Math.round(this.y + dy);

        if (!this.canColide) {
            return;
        }

        if (dy < 0) {
            if (this.isTouching(Tile.GROUND, { dir: Dir.UP })) {
                this.onUpCollision();
            }
        } else if (dy > 0) {
            if (this.isTouching(Tile.GROUND, { dir: Dir.DOWN })) {
                this.onDownCollision();
            }
        }
    }

    // Functions that can also be edited by subclasses
    onUpCollision() {
        const resetPos = this.level.getTilePosFromCoord(
            { y: this.minY },
            { y: 1 }
        );
        this.minY = resetPos + 1;

        this.dy = 0;
    }
    onDownCollision() {
        const resetPos = this.level.getTilePosFromCoord(
            { y: this.maxY },
            { y: 0 }
        );
        this.maxY = resetPos - 1;

        this.dy = 0;
    }
    onLeftCollision() {
        const resetPos = this.level.getTilePosFromCoord(
            { x: this.minX },
            { x: 1 }
        );
        this.minX = resetPos + 1;

        this.dx = 0;
    }
    onRightCollision() {
        const resetPos = this.level.getTilePosFromCoord(
            { x: this.maxX },
            { x: 0 }
        );
        this.maxX = resetPos - 1;

        this.dx = 0;
    }

    isStandingOnGround() {
        return this.isTouching(Tile.GROUND, {
            dir: Dir.DOWN,
            offset: { x: 0, y: 1 },
        });
    }

    isTouching(
        tile: Tile,
        { dir, offset = { x: 0, y: 0 } }: { dir?: Dir; offset?: Point } = {}
    ) {
        let coords: Point[];
        switch (dir) {
            case Dir.LEFT:
                coords = [
                    { x: this.minX, y: this.minY },
                    { x: this.minX, y: this.maxY },
                ];
                break;
            case Dir.RIGHT:
                coords = [
                    { x: this.maxX, y: this.minY },
                    { x: this.maxX, y: this.maxY },
                ];
                break;
            case Dir.UP:
                coords = [
                    { x: this.minX, y: this.minY },
                    { x: this.maxX, y: this.minY },
                ];
                break;
            case Dir.DOWN:
                coords = [
                    { x: this.minX, y: this.maxY },
                    { x: this.maxX, y: this.maxY },
                ];
                break;
            default:
                coords = [
                    { x: this.minX, y: this.minY },
                    { x: this.maxX, y: this.minY },
                    { x: this.minX, y: this.maxY },
                    { x: this.maxX, y: this.maxY },
                ];
        }
        return (
            coords
                // Add the offset
                .map((coord) => {
                    coord.x += offset.x;
                    coord.y += offset.y;
                    return coord;
                })
                // check if any position is touching
                .some((coord) => this.level.getTileFromCoord(coord) == tile)
        );
    }

    isOn(tile: Tile) {
        const coords = [
            { x: this.minX, y: this.minY },
            { x: this.maxX, y: this.minY },
            { x: this.minX, y: this.maxY },
            { x: this.maxX, y: this.maxY },
        ];
        return coords.every(
            (coord) => this.level.getTileFromCoord(coord) == tile
        );
    }

    isTouchingEntity(ent: Entity, leniency: number = 0) {
        return (
            ent.maxX + leniency > this.minX &&
            this.maxX + leniency > ent.minX &&
            ent.maxY + leniency > this.minY &&
            this.maxY + leniency > ent.minY
        );
    }

    //#region Getters and setter and junk.
    get minX() {
        return this.x;
    }

    set minX(val: number) {
        this.x = val;
    }

    get midX() {
        return this.x + this.w / 2;
    }

    set midX(val: number) {
        this.x = val - this.w / 2;
    }

    get maxX() {
        return this.x + this.w;
    }

    set maxX(val: number) {
        this.x = val - this.w;
    }

    get minY() {
        return this.y;
    }

    set minY(val: number) {
        this.y = val;
    }

    get midY() {
        return this.y + this.h / 2;
    }

    set midY(val: number) {
        this.y = val - this.h / 2;
    }

    get maxY() {
        return this.y + this.h;
    }

    set maxY(val: number) {
        this.y = val - this.h;
    }

    //#endregion
}
