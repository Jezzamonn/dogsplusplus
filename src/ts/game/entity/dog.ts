import { Entity, FacingDir } from "./entity";
import * as Aseprite from "../../aseprite-js";
import { FPS, physFromPx, PHYSICS_SCALE, rng } from "../constants";
import { Level } from "../level";
import { Keys } from "../../keys";
import { lerp } from "../../util";

Aseprite.loadImage({ name: "puppy", basePath: "sprites/" });

export class Dog extends Entity {
    walkSpeed = 1 * PHYSICS_SCALE * FPS;
    runSpeed = 1.5 * PHYSICS_SCALE * FPS;
    jumpSpeed = 3 * PHYSICS_SCALE * FPS;

    constructor(level: Level) {
        super(level);

        this.w = physFromPx(10) - 1;
        this.h = physFromPx(10) - 1;

        this.walkSpeed *= lerp(0.85, 1.3, rng());

        this.animCount = rng();

        this.debugColor = undefined;
    }

    get xMoveSpeed(): number {
        return this.running ? this.runSpeed : this.walkSpeed;
    }

    moveLeft(dt: number) {
        this.facingDir = FacingDir.LEFT;
        this.dx = -this.xMoveSpeed;
    }

    moveRight(dt: number) {
        this.facingDir = FacingDir.RIGHT;
        this.dx = this.xMoveSpeed;
    }

    jump() {
        this.dy = -this.jumpSpeed;
    }

    render(context: CanvasRenderingContext2D) {
        let animName = "idle";
        if (!this.isStandingOnGround()) {
            const jumpAnimationSwitch = 0.5 * PHYSICS_SCALE * FPS;
            if (this.dy < -jumpAnimationSwitch) {
                animName = "jump-up";
            } else if (this.dy < jumpAnimationSwitch) {
                animName = "jump-mid";
            } else {
                animName = "jump-down";
            }
        } else if (Math.abs(this.dx) > 0.1 * this.walkSpeed) {
            animName = "run";
        }

        let animCount = this.animCount;

        if (this.running) {
            animCount *= 2;
        }

        Aseprite.drawAnimation({
            context,
            image: "puppy",
            animationName: animName,
            time: animCount,
            position: {
                x: this.midX,
                y: this.maxY,
            },
            anchorRatios: {
                x: 0.5,
                y: 1,
            },
            scale: PHYSICS_SCALE,
            flippedX: this.facingDir == FacingDir.LEFT,
        });
    }
}
