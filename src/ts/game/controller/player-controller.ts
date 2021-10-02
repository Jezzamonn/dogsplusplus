import { Keys } from "../../keys";
import { Entity } from "../entity/entity";
import { Controller } from "./controller";

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

        if (onGround && Keys.wasPressedThisFrame("ArrowUp")) {
            entity.jump();
        }
    }
}
