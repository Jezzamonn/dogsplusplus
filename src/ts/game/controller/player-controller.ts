import { Keys } from "../../keys";
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

        const downestDog = entity.downestDog;

        const onGround = downestDog.isStandingOnGround();

        if (Keys.isPressed("ArrowLeft") && Keys.isPressed("ArrowRight")) {
            // nothing
        } else if (Keys.isPressed("ArrowLeft")) {
            downestDog.moveLeft(dt);
        } else if (Keys.isPressed("ArrowRight")) {
            downestDog.moveRight(dt);
        } else {
            downestDog.dampenX(dt);
        }

        downestDog.running = Keys.anyIsPressed(SHIFT_KEYS);

        // Feels weird on release.
        if (Keys.anyWasPressedThisFrame(JUMP_KEYS)) {
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
            if (Keys.wasPressedThisFrame("ArrowUp")) {
                if (entity.upDog) {
                    entity.controller = new StandController();
                    entity.upDog.controller = this;
                    PlayerController.hasMovedDown = true;
                }
            }
            else if (Keys.wasPressedThisFrame("ArrowDown")) {
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
