import { experp, lerp } from "../../util";
import { PHYSICS_SCALE, Point } from "../constants";
import { Game } from "../game";
import { Camera } from "./camera";

const screenPos = {x: 0.5, y: 0.7}

export class FocusCamera extends Camera {

    getFocalPoint?: () => Point;
    getDesiredScale?: () => number;

    curPos?: Point;
    curScale?: number;

    update(game: Game, dt: number): void {
        if (!this.getFocalPoint || !this.getDesiredScale) {
            return;
        }

        const desiredPoint = this.getFocalPoint();
        if (this.curPos == undefined) {
            this.curPos = desiredPoint;
        }

        const desiredScale = this.getDesiredScale();
        if (this.scale == undefined) {
            this.scale = desiredScale;
        }

        const updateSmoothness = 1 - Math.exp(-5 * dt);
        this.curPos.x = lerp(this.curPos.x, desiredPoint.x, updateSmoothness);
        this.curPos.y = lerp(this.curPos.y, desiredPoint.y, updateSmoothness);
        const scaleUpdateSmoothness = 1 - Math.exp(-0.2 * dt);
        this.scale = experp(this.scale, desiredScale, scaleUpdateSmoothness);
        this.scale = Math.min(3, this.scale);
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