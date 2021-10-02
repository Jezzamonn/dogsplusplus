import { Entity } from "../entity/entity";
import { Controller } from "./controller";

export class StandController extends Controller {

    update(entity: Entity, dt: number) {
        entity.dampenX(dt);
    }
}
