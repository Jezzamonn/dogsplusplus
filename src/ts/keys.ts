const disableDefaultKeys = new Set(["Space","ArrowUp","ArrowDown","ArrowLeft","ArrowRight"]);

export class IKeys {
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

    anyIsPressed(keyCodes: string[]): boolean {
        for (const keyCode of keyCodes) {
            if (this.isPressed(keyCode)) {
                return true;
            }
        }
        return false;
    }

    anyWasPressedThisFrame(keyCodes: string[]): boolean {
        for (const keyCode of keyCodes) {
            if (this.wasPressedThisFrame(keyCode)) {
                return true;
            }
        }
        return false;
    }

    anyWasReleasedThisFrame(keyCodes: string[]): boolean {
        for (const keyCode of keyCodes) {
            if (this.wasReleasedThisFrame(keyCode)) {
                return true;
            }
        }
        return false;
    }
}

class _Keys extends IKeys {
    #pressedKeys: Set<string> = new Set();
    #pressedThisFrame: Set<string> = new Set();
    #releasedThisFrame: Set<string> = new Set();

    setUp() {
        // Thought: Should this be adding to a number rather than triggering a boolean? Eh.
        document.addEventListener('keydown', (evt) => {
            if (!this.#pressedKeys.has(evt.code)) {
                this.#pressedThisFrame.add(evt.code);
                // console.log(evt.code);
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

export const Keys = new _Keys();

export const NullKeys = new IKeys();