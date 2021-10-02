import { Game } from "./game/game";

const timeStep = 1 / 60;

let canvas: HTMLCanvasElement;
let context: CanvasRenderingContext2D;
let game: Game;

function init(): void {
    canvas = document.querySelector('.canvas') as HTMLCanvasElement;
    context = canvas.getContext('2d')!;

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
    game.update(timeStep);
}

function render() {
    game.render(context);
}


window.onload = init;
