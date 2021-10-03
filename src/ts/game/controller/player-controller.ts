import { IKeys, Keys, NullKeys } from "../../keys";
import { Dog } from "../entity/dog";
import { Entity } from "../entity/entity";
import { Controller } from "./controller";
import { StandController } from "./stand-controller";

const UP_KEYS = ["ArrowUp", "KeyW"];
const DOWN_KEYS = ["ArrowDown", "KeyS"];
const LEFT_KEYS = ["ArrowLeft", "KeyA"];
const RIGHT_KEYS = ["ArrowRight", "KeyD"];
const JUMP_KEYS = ["KeyZ", "Space"];
const SHIFT_KEYS = ["ShiftLeft", "ShiftRight", "KeyX"];

export class PlayerController extends Controller {

    static hasMovedDown = false;

    doubleJumpCount = 0;

    constructor() {
        super();
    }

    update(entity: Entity, dt: number) {
        if (!(entity instanceof Dog)) {
            return;
        }

        let keys = Keys;

        // Sozza, can't move if you have a bone. Gotta reset.
        if (entity.gotBone) {
            keys = NullKeys;
        }

        const downestDog = entity.downestDog;

        const onGround = downestDog.isStandingOnGround();
        if (onGround) {
            this.doubleJumpCount = 0;
        }

        if (keys.anyIsPressed(LEFT_KEYS) && keys.anyIsPressed(RIGHT_KEYS)) {
            // nothing
        } else if (keys.anyIsPressed(LEFT_KEYS)) {
            downestDog.moveLeft(dt);
        } else if (keys.anyIsPressed(RIGHT_KEYS)) {
            downestDog.moveRight(dt);
        } else {
            downestDog.dampenX(dt);
        }

        downestDog.running = keys.anyIsPressed(SHIFT_KEYS);

        // Feels weird on release.
        if (keys.anyWasPressedThisFrame(JUMP_KEYS)) {
            if (onGround) {
                downestDog.jump();
            } else if (this.doubleJumpCount < 1) {
                // The double jump is to split.
                if (entity.downDog) {
                    entity.detach();
                    entity.jump();
                    this.doubleJumpCount++;
                }
                else if (entity.upDog) {
                    // Default to the second from the bottom.
                    entity.controller = new StandController();
                    entity.upDog.controller = this;

                    let upDog = entity.upDog;
                    upDog.detach();
                    upDog.jump();
                    this.doubleJumpCount++;
                }
            }
        }


        if (!PlayerController.hasMovedDown) {
            // Quick hack to allow for switching which dog you are.
            if (keys.anyWasPressedThisFrame(UP_KEYS)) {
                if (entity.upDog) {
                    entity.controller = new StandController();
                    entity.upDog.controller = this;
                    PlayerController.hasMovedDown = true;
                }
            }
            else if (keys.anyWasPressedThisFrame(DOWN_KEYS)) {
                if (entity.downDog) {
                    entity.controller = new StandController();
                    entity.downDog.controller = this;
                    PlayerController.hasMovedDown = true;
                }
            }
        }
    }

    static resetHasMovedDown() {
        PlayerController.hasMovedDown = false;
    }
}
