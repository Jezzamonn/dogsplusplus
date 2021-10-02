import { seededRandom } from "../util";

// Clarifying terms:
// GAMEPX = Number of pixel art style pixels
// PX = Actual pixels (well, aside from other scaling of the game.)
// PHYS = The fixed point thing the game physics works with.

export interface Point {
    x: number;
    y: number;
}

export const PHYSICS_SCALE = 8;
export const DEFAULT_PIXEL_SCALE = 3;

export const GAME_WIDTH_PX = 60 * 3 * DEFAULT_PIXEL_SCALE;
export const GAME_HEIGHT_PX = 60 * 2 * DEFAULT_PIXEL_SCALE;


export function physToPx(val: number): number {
    return val / PHYSICS_SCALE;
}

export function physToRoundedPx(val: number): number {
    return Math.round(val / PHYSICS_SCALE);
}

export function physFromPx(val: number): number {
    return val * PHYSICS_SCALE;
}

export function physFromPixelArt(val: number): number {
    return val * PHYSICS_SCALE * DEFAULT_PIXEL_SCALE;
}

export const rng = seededRandom("yolo");