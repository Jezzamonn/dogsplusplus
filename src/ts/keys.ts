const disableDefaultKeys = new Set(["Space","ArrowUp","ArrowDown","ArrowLeft","ArrowRight"]);

export interface IKeys {
    setUp(): void;
    resetFrame(): void;
    isPressed(keyCode: string): boolean;
    wasPressedThisFrame(keyCode: string): boolean;
    wasReleasedThisFrame(keyCode: string): boolean;
}

class _Keys implements IKeys {
    #pressedKeys: Set<string> = new Set();
    #pressedThisFrame: Set<string> = new Set();
    #releasedThisFrame: Set<string> = new Set();

    setUp() {
        // Thought: Should this be adding to a number rather than triggering a boolean? Eh.
        document.addEventListener('keydown', (evt) => {
            if (!this.#pressedKeys.has(evt.code)) {
                this.#pressedThisFrame.add(evt.code);
            }
            this.#pressedKeys.add(evt.code);

            // Also disable scrolling
            if (disableDefaultKeys.has(evt.code)) {
                evt.preventDefault();
            }
        });
        document.addEventListener('keyup', (evt) => {
            this.#pressedKeys.delete(evt.code);
            this.#releasedThisFrame.add(evt.code);
        });
    }

    resetFrame() {
        this.#pressedThisFrame.clear();
        this.#releasedThisFrame.clear();
    }

    isPressed(keyCode: string): boolean {
        return this.#pressedKeys.has(keyCode);
    }

    wasPressedThisFrame(keyCode: string): boolean {
        return this.#pressedThisFrame.has(keyCode);
    }

    wasReleasedThisFrame(keyCode: string): boolean {
        return this.#releasedThisFrame.has(keyCode);
    }

}

class _NullKeys implements IKeys {

    setUp(): void {}
    resetFrame(): void {}

    isPressed(keyCode: string): boolean {
        return false;
    }

    wasPressedThisFrame(keyCode: string): boolean {
        return false;
    }

    wasReleasedThisFrame(keyCode: string): boolean {
        return false;
    }
}

export const Keys = new _Keys();

export const NullKeys = new _NullKeys();