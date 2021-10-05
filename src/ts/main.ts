import { Game } from "./game/game";
import * as Aseprite from "./aseprite-js";
import * as Images from "./images";
import { Keys } from "./keys";

let simulatedTimeMs: number;
const timeStep = 1 / 60;

let canvas: HTMLCanvasElement;
let context: CanvasRenderingContext2D;
let game: Game;

async function init() {
    canvas = document.querySelector('.canvas') as HTMLCanvasElement;
    context = canvas.getContext('2d')!;

    Aseprite.disableSmoothing(context);
    Keys.setUp();

    await loadAllImages();

    game = new Game();

    requestAnimationFrame(doAnimationFrame);
}

function doAnimationFrame() {
    if (simulatedTimeMs == null) {
        simulatedTimeMs = Date.now();
    }

    let curTimeMs = Date.now();
    let updateCount = 0;
    while (simulatedTimeMs < curTimeMs) {
        fixedUpdate();

        simulatedTimeMs += timeStep * 1000;

        updateCount++;
        if (updateCount > 10) {
            simulatedTimeMs = curTimeMs;
            break;
        }
    }

    render();

    requestAnimationFrame(doAnimationFrame);
}

function fixedUpdate() {
    try {
        game.update(timeStep);
    }
    catch (e) {
        console.error(e);
    }
    Keys.resetFrame();
}

function render() {
    context.resetTransform();

    game.render(context);
}

async function loadAllImages() {
    await Images.loadImage({name: "tiles2", path: "sprites/", extension: "png"});
    await Images.loadImage({name: "trees", path: "sprites/", extension: "png"});
    await Game.awaitAllLevels();
}


window.onload = init;
