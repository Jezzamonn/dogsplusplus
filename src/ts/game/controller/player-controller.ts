import { Keys } from "../../keys";
import { Dog } from "../entity/dog";
import { Entity } from "../entity/entity";
import { Controller } from "./controller";

const JUMP_KEYS = ["KeyZ", "Space"];
const SHIFT_KEYS = ["ShiftLeft", "ShiftRight"];

export class PlayerController extends Controller {
    update(entity: Entity, dt: number) {
        const onGround = entity.isStandingOnGround();

        if (Keys.isPressed("ArrowLeft") && Keys.isPressed("ArrowRight")) {
            // nothing
        } else if (Keys.isPressed("ArrowLeft")) {
            entity.moveLeft(dt);
        } else if (Keys.isPressed("ArrowRight")) {
            entity.moveRight(dt);
        } else {
            entity.dampenX(dt);
        }

        entity.running = Keys.anyIsPressed(SHIFT_KEYS);

        // Feels weird on release.
        if (onGround && Keys.anyWasPressedThisFrame(JUMP_KEYS)) {
            entity.jump();
        }

        if (entity instanceof Dog) {
            entity.checkForUpDogs();
        }
    }
}
