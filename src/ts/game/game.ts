import { PHYSICS_SCALE } from "./constants";
import { Level } from "./level";

export class Game {

    canvas!: HTMLCanvasElement;
    context!: CanvasRenderingContext2D;

    scale = 4;

    level: Level;

    constructor() {
        this.level = new Level(this);
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