import { Entity } from "./entity";
import * as Aseprite from "../../aseprite-js";
import { Level } from "../level";
import { lerp, loop } from "../../util";
import { physFromPx, PHYSICS_SCALE } from "../constants";

Aseprite.loadImage({ name: "bone", basePath: "sprites/" });

export class Bone extends Entity {
    constructor(level: Level) {
        super(level);

        this.w = physFromPx(12);
        this.h = physFromPx(12);
        this.gravity = 0;
        this.canColide = false;
    }

    render(context: CanvasRenderingContext2D) {
        const float = 1.5;

        Aseprite.drawSprite({
            context,
            image: 'bone',
            frame: 0,
            position: {
                x: this.midX,
                y: this.midY + lerp(-physFromPx(float), physFromPx(float), loop(this.animCount)),
            },
            anchorRatios: {
                x: 0.5, y: 0.5,
            },
            scale: PHYSICS_SCALE,
        })
    }
}