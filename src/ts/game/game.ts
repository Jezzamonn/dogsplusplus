export class Game {

    canvas!: HTMLCanvasElement;
    context!: CanvasRenderingContext2D;

    totalDt: number = 0;

    constructor() {

    }


    update(dt: number): void {
        this.totalDt += dt;
    }

    render(context: CanvasRenderingContext2D): void {
        const h = 30 * this.totalDt;
        context.fillStyle = `hsl(${h.toFixed(2)}, 50%, 50%)`;
        context.fillRect(0, 0, context.canvas.width, context.canvas.height);
    }

}