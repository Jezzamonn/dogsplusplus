import { GAME_HEIGHT_PX, physFromPx, PHYSICS_SCALE } from "./constants";
import { Level } from "./level";
import * as Images from "../images";
import { Camera } from "./camera/camera";
import { FocusCamera } from "./camera/focus-camera";
import { Dog } from "./entity/dog";
import { PlayerController } from "./controller/player-controller";
import { Sounds } from "../sounds";
import { Keys } from "../keys";

Sounds.loadSound({name: "forest", path: "music/"});

export class Game {

    canvas!: HTMLCanvasElement;
    context!: CanvasRenderingContext2D;

    scale = 3;

    level: Level;
    camera: Camera;

    constructor() {
        this.level = new Level(this, Images.images["testlevel"].image!);


        const focusCamera = new FocusCamera();
        focusCamera.getFocalPoint = () => {
            const player = (this.level.getPlayer() as Dog).downestDog;
            if (!player) {
                return {x: 0, y: 0}
            }
            return {
                x: player.midX,
                y: player.midY,
            }
        }
        focusCamera.getDesiredScale = () => {
            const player = (this.level.getPlayer() as Dog).downestDog;
            const size = player.getDogSize();
            const totalHeight = physFromPx(10) * size;
            return physFromPx(GAME_HEIGHT_PX) / totalHeight;
        }

        this.camera = focusCamera;

        Sounds.loadMuteState();
        Sounds.setSong("forest");
    }

    update(dt: number): void {
        PlayerController.resetHasMovedDown();
        this.level.update(dt);

        this.camera.update(this, dt);

        if (this.level.done) {
            this.level.reset();
        }

        if (Keys.wasPressedThisFrame("KeyR")) {
            this.level.reset();
        }

        if (Keys.wasPressedThisFrame("KeyM")) {
            Sounds.toggleMute();
        }
    }

    render(context: CanvasRenderingContext2D): void {
        this.camera.applyToContext(context);

        this.level.render(context);
    }
}