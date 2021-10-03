import { IKeys, Keys, NullKeys } from "../../keys";
import { Dog } from "../entity/dog";
import { Entity } from "../entity/entity";
import { Controller } from "./controller";
import { StandController } from "./stand-controller";

const JUMP_KEYS = ["KeyZ", "Space"];
const SHIFT_KEYS = ["ShiftLeft", "ShiftRight"];

export class PlayerController extends Controller {

    static hasMovedDown = false;

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

        if (keys.isPressed("ArrowLeft") && keys.isPressed("ArrowRight")) {
            // nothing
        } else if (keys.isPressed("ArrowLeft")) {
            downestDog.moveLeft(dt);
        } else if (keys.isPressed("ArrowRight")) {
            downestDog.moveRight(dt);
        } else {
            downestDog.dampenX(dt);
        }

        downestDog.running = keys.anyIsPressed(SHIFT_KEYS);

        // Feels weird on release.
        if (keys.anyWasPressedThisFrame(JUMP_KEYS)) {
            if (onGround) {
                downestDog.jump();
            }
            // The double jump is to split
            else if (entity.downDog) {
                entity.detach();
                entity.jump();
            }
        }


        if (!PlayerController.hasMovedDown) {
            // Quick hack to allow for switching which dog you are.
            if (keys.wasPressedThisFrame("ArrowUp")) {
                if (entity.upDog) {
                    entity.controller = new StandController();
                    entity.upDog.controller = this;
                    PlayerController.hasMovedDown = true;
                }
            }
            else if (keys.wasPressedThisFrame("ArrowDown")) {
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
