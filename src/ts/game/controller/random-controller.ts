import { choose } from "../../util";
import { rng } from "../constants";
import { Entity, FacingDir } from "../entity/entity";
import { Controller } from "./controller";

export class RandomController extends Controller {
    dir? = FacingDir.LEFT;

    update(entity: Entity, dt: number) {
        if (rng() < 0.05) {
            this.dir = choose(
                [FacingDir.LEFT, FacingDir.RIGHT, undefined],
                rng
            );
        }

        if (this.dir == FacingDir.LEFT) {
            entity.moveLeft(dt);
        } else if (this.dir == FacingDir.RIGHT) {
            entity.moveRight(dt);
        } else {
            entity.dampenX(dt);
        }

        const onGround = entity.isStandingOnGround();

        if (onGround && rng() < 0.01) {
            entity.jump();
        }
    }
}
