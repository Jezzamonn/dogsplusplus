import { Entity } from "./entity";
import * as Aseprite from "../../aseprite-js";
import { PHYSICS_SCALE } from "../constants";
import { Level } from "../level";

Aseprite.loadImage({name: "puppy", basePath: "sprites/"})

export class Player extends Entity {

    constructor(level: Level) {
        super(level);

        this.debugColor = undefined;
    }

    render(context: CanvasRenderingContext2D) {
        super.render(context);

        Aseprite.drawAnimation({
            context,
            image: "puppy",
            animationName: "run",
            time: this.animCounter,
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