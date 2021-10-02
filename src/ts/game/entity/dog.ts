import { Entity, FacingDir } from "./entity";
import * as Aseprite from "../../aseprite-js";
import { FPS, physFromPx, PHYSICS_SCALE, rng } from "../constants";
import { Level } from "../level";
import { Keys } from "../../keys";
import { clamp, clampInvLerp, easeInOut, invLerp, lerp } from "../../util";
import { PlayerController } from "../controller/player-controller";

Aseprite.loadImage({ name: "puppy", basePath: "sprites/" });

export class Dog extends Entity {
    walkSpeed = 1 * PHYSICS_SCALE * FPS;
    runSpeed = 1.5 * PHYSICS_SCALE * FPS;
    jumpSpeed = 3 * PHYSICS_SCALE * FPS;

    upDog?: Dog;
    downDog?: Dog;
    reachedDesiredPosition = false;
    canBePickedUp = false;

    hue: number = 0;

    constructor(level: Level) {
        super(level);

        this.w = physFromPx(10) - 2;
        this.h = physFromPx(10) - 1;

        this.walkSpeed *= lerp(0.85, 1.3, rng());

        this.animCount = rng();
        this.hue = rng();

        this.debugColor = undefined;
    }

    get filterString() {
        return `hue-rotate(${(360 * this.hue).toFixed(0)}deg)`;
    }

    update(dt: number) {
        if (this.downDog) {
            return;
        }
        this.regularUpdate(dt);
    }

    updateController(dt: number) {
        // if (this.downDog) {
        //     return;
        // }
        this.controller?.update(this, dt);
    }

    regularUpdate(dt: number) {
        if (this.upDog) {
            this.upDog.dy = this.dy;
            this.upDog.regularUpdate(dt);
        }

        super.update(dt);

        this.moveUpDog(dt);

        if (this.downDog == undefined) {
            this.checkForUpDogs();
        }

        if (this.isStandingOnGround()) {
            this.canBePickedUp = true;
        }
    }

    moveUpDog(dt: number) {
        if (this.downDog == undefined) {
            if (!this.reachedDesiredPosition) {
                console.log(`${this.index} reset because I'm the down dog`);
            }
            this.reachedDesiredPosition = true;
        }

        // TODO: These maxes should probably have dt worked into them somehow.
        // Also the 0.3 multipliers need to be updated for slowmo.
        if (this.upDog) {
            const maxXDistAllowed = physFromPx(8);

            let desiredMidX = this.midX;
            let xDiff = desiredMidX - this.upDog.midX;

            let xDiffAmt = clampInvLerp(Math.abs(xDiff), 0, physFromPx(10));
            let height = lerp(physFromPx(10) + 1, physFromPx(7), xDiffAmt);
            let desiredMaxY = this.maxY - height;
            let yDiff = desiredMaxY - this.upDog.maxY;

            this.upDog.moveX(0.3 * xDiff);
            this.upDog.moveY(0.3 * yDiff);

            // TODO: Knock things off.
            this.upDog.facingDir = this.facingDir;

            // Check to see if the dog is too far away
            let newXDiff = desiredMidX - this.upDog.midX;
            let newYDiff = desiredMaxY - this.upDog.maxY;
            if (
                Math.abs(newXDiff) > maxXDistAllowed
            ) {
                if (this.upDog.allDownDogsReachedDesiredPosition()) {
                    // un-stable the dog
                    this.upDog.dx = lerp(-this.walkSpeed, this.walkSpeed, rng());
                    this.upDog.downDog = undefined;
                    this.upDog.canBePickedUp = false;
                    this.upDog = undefined;
                }
            }
            else if (this.upDog.reachedDesiredPosition == false) {
                console.log(`${this.index} at pos ${this.upDog.index}`);
                this.upDog.reachedDesiredPosition = true;
            }
        }
    }

    checkForUpDogs() {
        for (const ent of this.level.entities) {
            if (ent === this) {
                continue;
            }

            if (!(ent instanceof Dog)) {
                continue;
            }

            if (ent.downDog) {
                continue;
            }

            // if (ent.upDog) {
            //     continue;
            // }

            if (ent.controller instanceof PlayerController) {
                continue;
            }

            if (this.isTouchingEntity(ent, physFromPx(-3))) {
                ent.forAllUpDogs(d => d.reachedDesiredPosition = false);
                const upMostDog = this.upperMostDog;
                upMostDog.upDog = ent;
                ent.downDog = upMostDog;
            }
        }
    }

    forAllUpDogs(fn: (dog: Dog) => any) {
        let upDog: Dog = this;
        fn(upDog);
        while (upDog.upDog) {
            upDog = upDog.upDog;
            fn(upDog);
        }
        return upDog;
    }

    allDownDogsReachedDesiredPosition() {
        let dog: Dog = this;

        if (!dog.reachedDesiredPosition) {
            return false;
        }

        while (dog.downDog) {
            dog = dog.downDog;
            if (!dog.reachedDesiredPosition) {
                return false;
            }
        }
        return true;
    }

    get upperMostDog() {
        let upDog: Dog = this;
        while (upDog.upDog) {
            upDog = upDog.upDog;
        }
        return upDog;
    }

    get downestDog() {
        let downDog: Dog = this;
        while (downDog.downDog) {
            downDog = downDog.downDog;
        }
        return downDog;
    }

    getDogSize(): number {
        let size = 1;
        let upDog: Dog = this;
        while (upDog.upDog) {
            upDog = upDog.upDog;
            size ++;
        }
        return size;
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
        this.upDog?.jump();
    }

    regularRender(context: CanvasRenderingContext2D) {
        if (this.upDog) {
            this.upDog.regularRender(context);
        }

        const position = {
            x: this.midX,
            y: this.maxY,
        }

        const jumpAnimationSwitch = 0.5 * PHYSICS_SCALE * FPS;

        let animName = "idle";
        if (this.downDog) {
            position.y += physFromPx(1);
            if (this.dy < -jumpAnimationSwitch) {
                animName = "riding-up";
            } else if (this.dy < jumpAnimationSwitch) {
                animName = "riding-mid";
            } else {
                animName = "riding-down";
            }
        } else if (!this.isStandingOnGround()) {
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
            position,
            anchorRatios: {
                x: 0.5,
                y: 1,
            },
            scale: PHYSICS_SCALE,
            flippedX: this.facingDir == FacingDir.LEFT,
            filter: this.filterString,
        });
    }

    render(context: CanvasRenderingContext2D) {
        if (this.downDog) {
            return;
        }
        this.regularRender(context);
    }
}
