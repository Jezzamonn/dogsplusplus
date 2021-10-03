import { Game } from "./game/game";
import * as Aseprite from "./aseprite-js";
import * as Images from "./images";
import { Keys } from "./keys";

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

function doAnimationFrame(): void {
    // TODO: The fixed time step stuff.
    fixedUpdate();
    render();

    requestAnimationFrame(doAnimationFrame);
}

function fixedUpdate() {
    try {
        game.update(timeStep);
        Keys.resetFrame();
    } catch (e) {
        console.error(e);
    }
}

function render() {
    context.resetTransform();

    game.render(context);
}

async function loadAllImages() {
    await Images.loadImage({name: "testlevel", path: "levels/", extension: "gif"});
    await Images.loadImage({name: "tiles2", path: "sprites/", extension: "png"});
    await Images.loadImage({name: "trees", path: "sprites/", extension: "png"});
}


window.onload = init;
