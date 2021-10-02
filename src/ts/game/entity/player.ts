import { Entity } from "./entity";
import * as Aseprite from "../../aseprite-js";
import { PHYSICS_SCALE, rng } from "../constants";
import { Level } from "../level";

Aseprite.loadImage({name: "puppy", basePath: "sprites/"})

export class Player extends Entity {

    constructor(level: Level) {
        super(level);

        this.animCount = rng();

        this.debugColor = undefined;
    }

    onDownCollision() {
        let startDy = this.dy;

        super.onDownCollision();

        this.dy = -0.6 * startDy;
    }

    render(context: CanvasRenderingContext2D) {
        const animName = this.isStandingOnGround() ? 'idle' : 'run';

        Aseprite.drawAnimation({
            context,
            image: "puppy",
            animationName: animName,
            time: this.animCount,
            position: {
                x: this.midX,
                y: this.maxY,
            },
            anchorRatios: {
                x: 0.5,
                y: 1,
            },
            scale: PHYSICS_SCALE,
        });
    }
}