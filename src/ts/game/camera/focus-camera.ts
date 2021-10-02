import { lerp } from "../../util";
import { PHYSICS_SCALE, Point } from "../constants";
import { Game } from "../game";
import { Camera } from "./camera";

const screenPos = {x: 0.5, y: 0.7}

export class FocusCamera extends Camera {

    getFocalPoint?: () => Point;

    curPos?: Point;
    scale = 3;

    update(game: Game, dt: number): void {
        if (!this.getFocalPoint) {
            return;
        }

        const desiredPoint = this.getFocalPoint();
        if (this.curPos == null) {
            this.curPos = desiredPoint;
            return;
        }
        const updateSmoothness = 1 - Math.exp(-3 * dt);
        this.curPos.x = lerp(this.curPos.x, desiredPoint.x, updateSmoothness);
        this.curPos.y = lerp(this.curPos.y, desiredPoint.y, updateSmoothness);
    }

    applyToContext(context: CanvasRenderingContext2D) {
        // TODO: Figure out how to avoid the aliasing
        context.translate(
            screenPos.x * context.canvas.width,
            screenPos.y * context.canvas.height);

        if (!this.curPos) {
            return;
        }

        context.scale(this.scale / PHYSICS_SCALE, this.scale / PHYSICS_SCALE);

        context.translate(-this.curPos.x, -this.curPos.y);
    }


}