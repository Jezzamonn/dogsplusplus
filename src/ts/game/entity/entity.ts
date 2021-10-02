import { Level } from "../level";

export class Entity {

    level: Level;

    x: number = 0;
    y: number = 0;
    w: number = 0;
    h: number = 0;
    dx: number = 0;
    dy: number = 0;

    animCounter: number = 0;

    debugColor? = '#f68187';

    constructor(level: Level) {
        this.level = level;
    }

    update(dt: number) {
        this.animCounter += dt;
    }

    render(context: CanvasRenderingContext2D) {
        if (this.debugColor == null) {
            return;
        }
        context.fillStyle = this.debugColor;
        context.fillRect(this.x, this.y, this.w, this.h);
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
