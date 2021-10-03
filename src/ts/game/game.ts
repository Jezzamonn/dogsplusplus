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

const LEVELS = [
    "intro",
    "dogs-on-head",
    "double-jump",
    "select-a-dog",
    "unstable",
    "multibone",
    "getting-stuck",
    "testlevel",
    "move-tower",
    "win",
];

export class Game {

    canvas!: HTMLCanvasElement;
    context!: CanvasRenderingContext2D;

    level!: Level;
    camera: Camera;
    levelIndex = 0;

    getLevelImage() {
        const name = LEVELS[this.levelIndex];
        return Images.images[name].image!
    }

    constructor() {
        this.loadLevel();

        const focusCamera = new FocusCamera();
        focusCamera.getFocalPoint = () => {
            const player = (this.level.getPlayer() as Dog)?.downestDog;
            if (!player) {
                return {x: 0, y: 0}
            }
            return {
                x: player.midX,
                y: player.midY,
            }
        }
        focusCamera.getDesiredScale = () => {
            const player = (this.level.getPlayer() as Dog)?.downestDog;
            if (!player) {
                return 3;
            }
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
            if (this.level.won) {
                this.nextLevel();
            }
            this.loadLevel();
        }

        if (Keys.wasPressedThisFrame("KeyR")) {
            this.loadLevel();
        }

        if (Keys.wasPressedThisFrame("KeyM")) {
            Sounds.toggleMute();
        }
    }

    nextLevel() {
        this.levelIndex++;
        if (this.levelIndex >= LEVELS.length) {
            this.levelIndex = LEVELS.length - 1;
        }
    }

    loadLevel() {
        const name = LEVELS[this.levelIndex];
        this.level = new Level(this, name);
    }

    render(context: CanvasRenderingContext2D): void {
        this.camera.applyToContext(context);

        this.level.render(context);
    }

    static async awaitAllLevels() {
        for (const levelName of LEVELS) {
            if (Images.images[levelName]) {
                continue;
            }
            await Images.loadImage({name: levelName, path: 'levels/', extension: 'gif'});
        }
    }
}