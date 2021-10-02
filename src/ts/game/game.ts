import { PHYSICS_SCALE } from "./constants";
import { Level } from "./level";
import * as Images from "../images";

export class Game {

    canvas!: HTMLCanvasElement;
    context!: CanvasRenderingContext2D;

    scale = 3;

    level: Level;

    constructor() {
        this.level = new Level(this, Images.images["testlevel"].image!);
    }

    update(dt: number): void {
        this.level.update(dt);
    }

    render(context: CanvasRenderingContext2D): void {
        this.renderBG(context);

        context.scale(this.scale / PHYSICS_SCALE, this.scale / PHYSICS_SCALE);

        this.level.render(context);
    }

    renderBG(context: CanvasRenderingContext2D): void {
        context.fillStyle = `#00cdf9`;
        context.fillRect(0, 0, context.canvas.width, context.canvas.height);
    }
}