import { Entity, FacingDir } from "./entity";
import * as Aseprite from "../../aseprite-js";
import { FPS, physFromPx, PHYSICS_SCALE, rng } from "../constants";
import { Level } from "../level";
import { Keys } from "../../keys";
import { clamp, clampInvLerp, invLerp, lerp } from "../../util";

Aseprite.loadImage({ name: "puppy", basePath: "sprites/" });

export class Dog extends Entity {

    walkSpeed = 1 * PHYSICS_SCALE * FPS;
    runSpeed = 1.5 * PHYSICS_SCALE * FPS;
    jumpSpeed = 3 * PHYSICS_SCALE * FPS;

    upDog?: Dog;
    downDog?: Dog;

    constructor(level: Level) {
        super(level);

        this.w = physFromPx(10) - 1;
        this.h = physFromPx(10) - 1;

        this.walkSpeed *= lerp(0.85, 1.3, rng());

        this.animCount = rng();

        this.debugColor = undefined;
    }

    update(dt: number) {
        super.update(dt);

        if (this.upDog) {
            let xDiff = this.midX - this.upDog.midX;
            this.upDog.moveX(0.3 * xDiff);

            let xDiffAmt = clampInvLerp(Math.abs(xDiff), 0, physFromPx(4));

            let height = lerp(physFromPx(7), physFromPx(10), xDiffAmt)

            let yDiff = (this.y - height) - this.upDog.y;

            // TODO: Something to make the tower more fragile
            // TODO: Knock things off.

            this.upDog.moveY(yDiff);

            this.upDog.facingDir = this.facingDir;

            this.upDog.dy = 0;
        }
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

    regularRender(context: CanvasRenderingContext2D) {
        if (this.upDog) {
            this.upDog.regularRender(context);
        }

        let animName = "idle";
        if (this.downDog) {
            animName = 'idle';
        }
        else if (!this.isStandingOnGround()) {
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

    render(context: CanvasRenderingContext2D) {
        if (this.downDog) {
            return;
        }
        this.regularRender(context);
    }
}
