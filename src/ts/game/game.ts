import { PHYSICS_SCALE } from "./constants";
import { Level } from "./level";
import * as Images from "../images";
import { Camera } from "./camera/camera";
import { FocusCamera } from "./camera/focus-camera";

export class Game {

    canvas!: HTMLCanvasElement;
    context!: CanvasRenderingContext2D;

    scale = 3;

    level: Level;
    camera: Camera;

    constructor() {
        this.level = new Level(this, Images.images["testlevel"].image!);


        const focusCamera = new FocusCamera();
        focusCamera.getFocalPoint = () => {
            const player = this.level.getPlayer();
            if (!player) {
                return {x: 0, y: 0}
            }
            return {
                x: player.midX,
                y: player.midY,
            }
        }

        this.camera = focusCamera;
    }

    update(dt: number): void {
        this.level.update(dt);

        this.camera.update(this, dt);
    }

    render(context: CanvasRenderingContext2D): void {
        this.renderBG(context);

        this.camera.applyToContext(context);

        this.level.render(context);
    }

    renderBG(context: CanvasRenderingContext2D): void {
        context.fillStyle = `#00cdf9`;
        context.fillRect(0, 0, context.canvas.width, context.canvas.height);
    }
}