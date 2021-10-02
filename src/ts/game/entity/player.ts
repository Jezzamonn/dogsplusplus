import { Entity, FacingDir } from "./entity";
import * as Aseprite from "../../aseprite-js";
import { FPS, physFromPx, PHYSICS_SCALE, rng } from "../constants";
import { Level } from "../level";
import { Keys } from "../../keys";
import { lerp } from "../../util";

Aseprite.loadImage({name: "puppy", basePath: "sprites/"})

export class Player extends Entity {

    walkSpeed = 1.2 * PHYSICS_SCALE * FPS;
    jumpSpeed = 3 * PHYSICS_SCALE * FPS;

    constructor(level: Level) {
        super(level);

        this.w = physFromPx(10) - 1;
        this.h = physFromPx(10) - 1;

        this.walkSpeed *= lerp(0.85, 1.3, rng());

        this.animCount = rng();

        this.debugColor = undefined;
    }

    update(dt: number) {
        this.animCount += dt;

        const onGround = this.isStandingOnGround();

        if (Keys.isPressed("ArrowLeft") && Keys.isPressed("ArrowRight")) {
            // nothing
        }
        else if (Keys.isPressed("ArrowLeft")) {
            this.facingDir = FacingDir.LEFT;
            this.dx = -this.walkSpeed;
        }
        else if (Keys.isPressed("ArrowRight")) {
            this.facingDir = FacingDir.RIGHT;
            this.dx = this.walkSpeed;
        }
        else {
            this.dampenX(dt);
        }

        if (onGround && Keys.wasPressedThisFrame("ArrowUp")) {
            this.jump();
        }

        this.applyGravity(dt);
        this.moveX(dt);
        this.moveY(dt);
    }

    jump() {
        this.dy = -this.jumpSpeed;
    }

    render(context: CanvasRenderingContext2D) {
        let animName = 'idle';
        if (!this.isStandingOnGround()) {
            const jumpAnimationSwitch = 0.5 * PHYSICS_SCALE * FPS;
            if (this.dy < -jumpAnimationSwitch) {
                animName = 'jump-up';
            }
            else if (this.dy < jumpAnimationSwitch) {
                animName = 'jump-mid';
            }
            else {
                animName = 'jump-down';
            }
        }
        else if (Math.abs(this.dx) > 0.1 * this.walkSpeed) {
            animName = 'run';
        }

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
            flippedX: this.facingDir == FacingDir.LEFT,
        });
    }
}