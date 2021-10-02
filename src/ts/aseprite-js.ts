interface Point {
    x: number;
    y: number;
}

interface Size {
    w: number;
    h: number;
}

interface Box {
    x: number;
    y: number;
    w: number;
    h: number;
}

/** What's exported from Aseprite for a frame. */
interface FrameMetadata {
    /** Aseprite filename that this animation came from. */
    filename: string;
    /** The bounding box for this frame in the spritesheet. */
    frame: Box;
    rotated: boolean;
    /** Not sure what this is, but related to the bounding box, I guess. */
    spriteSourceSize: Box;
    /** Also not super sure what this is, but related to the bounding box, I guess. */
    sourceSize: Size;
    /** How long this frame should be shown for, in milliseconds */
    duration: number;
}

/** Data pulled out from the frame tags. */
interface AnimationMetadata {
    /** Starting frame of this animation. */
    from: number;
    /** Ending frame of this animation. */
    to: number;
    /** Entire duration of this animation. */
    length: number;
}

/** Metadata for a spritesheet. */
interface ImageMetadata {
    /** Name of this image. */
    name: string;
    /** Whether the image has been loaded. */
    imageLoaded: boolean;
    /** Whether the json metadata has been loaded. */
    jsonLoaded: boolean;
    /** Whether the image and json have been loaded. */
    loaded: boolean;
    /** The image, once it has been loaded. */
    image?: HTMLImageElement;
    /** Metadata for each frame. */
    frames?: FrameMetadata[];
    /** Metadata for each labeled animation. */
    animations: {
        [key: string]: AnimationMetadata;
    };
}

/**
 * Map of all the images and their metadata.
 *
 * Treat this as read-only, but if you need to access information like the
 * lengths of animations you can use this.
 */
export const images: { [s: string]: ImageMetadata } = {};

/** Information for loading a spritesheet and its metadata. */
interface ImageInfo {
    /**
     * Name of the image file and its metadata. The image should be name.png and
     * the metadata should be name.json.
     */
    name: string;
    /**
     * Location of the image file and its metadata. Both files should be in the
     * same place.
     */
    basePath?: string;
    /**
     * Name of the image file and its metadata. The image should be name.png
     * and the metadata should be name.json.
     */
    imagePath?: string;
    /**
     * Location of the image file and its metadata. Both files should be in the
     * same place.
     */
    jsonPath?: string;
}

/**
 * Preloads multiple images.
 *
 * See `loadImage` for more info.
 */
export function loadImages(imageInfos: ImageInfo[]) {
    for (const imageInfo of imageInfos) {
        loadImage(imageInfo);
    }
}

/**
 * Asynchronously fetches an image and it's associated metadata, and saves it in
 * the images map.
 *
 * You can either use `basePath` to specify the directory that contains both the
 * image and its metadata, or you can specify the full path to each using
 * `imagePath` and `jsonPath`. If you specify just the directory, the files need
 * to be called [name].png and [name].json.
 */
export function loadImage({
    name,
    basePath = undefined,
    imagePath = undefined,
    jsonPath = undefined,
}: ImageInfo) {
    if (!basePath && (!imagePath || !jsonPath)) {
        throw "Must specify either a basePath or imagePath and jsonPath";
    }

    if (images.hasOwnProperty(name)) {
        return;
    }

    if (!imagePath || !jsonPath) {
        // As this stage we know basePath is defined, so force the compiler to
        // acknowledge that.
        basePath = basePath!;
        if (!basePath.endsWith("/")) {
            basePath = basePath + "/";
        }
        imagePath = `${basePath}${name}.png`;
        jsonPath = `${basePath}${name}.json`;
    }

    images[name] = {
        name,
        imageLoaded: false,
        jsonLoaded: false,
        loaded: false,
        animations: {},
    };
    const image = new Image();
    image.onload = () => {
        images[name].image = image;
        images[name].imageLoaded = true;
        images[name].loaded = images[name].jsonLoaded;
    };
    image.onerror = () => {
        throw new Error(`Error loading image ${name}.`);
    };
    image.src = imagePath;
    // Load JSON metadata.
    fetch(jsonPath)
        .then((response) => {
            if (response.status != 200) {
                throw new Error(
                    `Couldn't load json metadata for image ${name}.`
                );
            }
            return response.json();
        })
        .then((response) => {
            // Note: This currently ignores direction.
            const animations: {
                [key: string]: AnimationMetadata;
            } = {};

            for (const animData of response.meta.frameTags) {
                let length = 0;
                for (let i = animData.from; i <= animData.to; i++) {
                    length += response.frames[i].duration;
                }
                animations[animData.name] = {
                    from: animData.from,
                    to: animData.to,
                    length,
                };
            }
            images[name].animations = animations;
            images[name].frames = response.frames;
            images[name].jsonLoaded = true;
            images[name].loaded = images[name].imageLoaded;
        });
}

/**
 * Applies a filter on an image, and caches the result.
 *
 * @param {string} name Name of the existing image
 * @param {string} filter Filter to apply
 * @returns {!ImageMetadata} new metadata of the filtered image.
 */
export function applyFilter(name: string, filter: string): ImageMetadata {
    const filteredImageName = getFilteredName(name, filter);
    if (images[filteredImageName] != undefined) {
        return images[filteredImageName];
    }

    if (!images.hasOwnProperty(name)) {
        throw new Error(
            `Cannot apply filter to image ${name} as it doesn\'t exist.`
        );
    }

    const baseImageMetadata = images[name];

    images[filteredImageName] = {
        name: filteredImageName,
        imageLoaded: false,
        jsonLoaded: true,
        loaded: false,
        animations: baseImageMetadata.animations,
        frames: baseImageMetadata.frames,
    };

    if (baseImageMetadata.image == null) {
        throw new Error(
            `Can't generate filtered image until base image is loaded.`
        );
    }

    const canvas = document.createElement("canvas");
    canvas.width = baseImageMetadata.image.width;
    canvas.height = baseImageMetadata.image.height;

    const context = canvas.getContext("2d")!;
    context.filter = filter;

    context.drawImage(baseImageMetadata.image, 0, 0);
    const image = new Image();
    // Even though we're setting the source from a data url, it still needs to load.
    image.onload = () => {
        images[filteredImageName].image = image;
        images[filteredImageName].imageLoaded = true;
        images[filteredImageName].loaded = true;
    };
    image.onerror = () => {
        throw new Error(`Error loading image ${name}.`);
    };
    image.src = canvas.toDataURL();

    return images[filteredImageName];
}

/**
 * @param {string} name Name of the existing image
 * @param {string} filter Filter to apply
 */
function getFilteredName(name: string, filter: string) {
    return name + ":filter=" + filter;
}

/**
 * Renders a specific frame to a canvas.
 *
 * @param p - Input to this function, as an object.
 * @param p.context - The context of the canvas to draw on.
 * @param p.image - The name, or image metadata of the spritesheet to draw.
 * @param p.frame - The frame number to draw.
 * @param p.position - The position on the canvas to draw this sprite
 * @param p.scale - How much to upscale the sprite. Should be an integer.
 * @param p.anchorRatios - The relative position of the anchor on this sprite.
 *     The anchor is used for positioning the sprite and for scaling. 0 puts
 *     the anchor at the left or the top, 1 puts the anchor at the right or the
 *     bottom. 0.5 positions the anchor at the center. Defaults to top left.
 * @param p.flipped Whether to flip the image horizontally.
 * @param p.filter A CSS filter to apply to the image. This will be cached for
 *     performance.
 * @returns True if it succeeded, false if the image wasn't loaded yet.
 */
export function drawSprite({
    context,
    image,
    frame,
    position,
    scale = 1,
    anchorRatios = {
        x: 0,
        y: 0,
    },
    flippedX = false,
    flippedY = false,
    filter = "",
}: {
    context: CanvasRenderingContext2D;
    image: string | ImageMetadata;
    frame: number;
    position: Point;
    scale?: number;
    anchorRatios?: Point;
    flippedX?: boolean;
    flippedY?: boolean;
    filter?: string;
}): boolean {
    if (typeof image === "string") {
        image = images[image];
    }

    if (!image.loaded) {
        return false;
    }

    if (filter != null && filter.length > 0) {
        applyFilter(image.name, filter);
        image = images[getFilteredName(image.name, filter)];

        // The filtered image might not be loaded.
        if (!image.loaded) {
            return false;
        }
    }

    if (!image.frames) {
        return false;
    }

    const sourceRect = image.frames[frame].frame;
    const destW = scale * sourceRect.w;
    const destH = scale * sourceRect.h;

    context.save();
    context.translate(Math.round(position.x), Math.round(position.y));

    const adjustedAnchorRatios = {
        x: anchorRatios.x,
        y: anchorRatios.y,
    };

    if (flippedX) {
        context.scale(-1, 1);
        adjustedAnchorRatios.x = 1 - adjustedAnchorRatios.x;
    }
    if (flippedY) {
        context.scale(1, -1);
        adjustedAnchorRatios.y = 1 - adjustedAnchorRatios.y;
    }

    context.drawImage(
        image.image!,
        sourceRect.x,
        sourceRect.y,
        sourceRect.w,
        sourceRect.h,
        -adjustedAnchorRatios.x * destW,
        -adjustedAnchorRatios.y * destH,
        destW,
        destH
    );

    context.restore();

    return true;
}

/**
 * Renders a frame of an animation to the canvas, based on the input time.
 *
 * Assumes all animations loop.
 *
 * @param p - Input to this function, as an object.
 * @param p.context - The context of the canvas to draw on.
 * @param p.image - The name, or image metadata of the spritesheet to draw.
 * @param p.animationName - The name of the animation.
 * @param p.time - The position of this animation in time, relative to
 *     the start. In seconds. Determines which frame to render.
 * @param p.position - The position on the canvas to draw this sprite
 * @param p.scale - How much to upscale the sprite. Should be an integer.
 * @param p.anchorRatios - The relative position of the anchor on this sprite.
 *     The anchor is used for positioning the sprite and for scaling. 0 puts
 *     the anchor at the left or the top, 1 puts the anchor at the right or the
 *     bottom. 0.5 positions the anchor at the center. Defaults to top left.
 * @param p.flipped Whether to flip the image horizontally.
 * @param p.filter A CSS filter to apply to the image. This will be cached for
 *     performance.
 * @returns True if it succeeded, false if the image wasn't loaded yet.
 */
export function drawAnimation({
    context,
    image,
    animationName,
    time,
    position,
    scale = 1,
    anchorRatios = {
        x: 0,
        y: 0,
    },
    flippedX = false,
    flippedY = false,
    filter = "",
}: {
    context: CanvasRenderingContext2D;
    image: string | ImageMetadata;
    animationName: string;
    time: number;
    position: Point;
    scale?: number;
    anchorRatios?: Point;
    flippedX?: boolean;
    flippedY?: boolean;
    filter?: string;
}): boolean {
    if (typeof image === "string") {
        image = images[image];
    }

    if (!image.loaded) {
        return false;
    }

    const frame = getFrame(image, animationName, time);

    return drawSprite({
        context,
        image,
        frame,
        position,
        scale,
        anchorRatios,
        flippedX,
        flippedY,
        filter,
    });
}

/**
 * Figures out which frame of the animation we should draw.
 */
function getFrame(
    imageData: ImageMetadata,
    animationName: string,
    time: number
) {
    if (!imageData.frames) {
        return -1;
    }
    const animData = imageData.animations[animationName];
    const localTimeMs = (1000 * time) % animData.length;
    let cumulativeTimeMs = 0;
    for (let i = animData.from; i <= animData.to; i++) {
        cumulativeTimeMs += imageData.frames[i].duration;
        if (cumulativeTimeMs > localTimeMs) {
            return i;
        }
    }
    throw new Error(`Something's wrong with the getFrame function`);
}

/**
 * Disables smoothing on the canvas across the different browsers.
 *
 * Keeps those pixels sharp!
 */
export function disableSmoothing(context: CanvasRenderingContext2D) {
    context.imageSmoothingEnabled = false;
    (context as any).msImageSmoothingEnabled = false;
    (context as any).webkitImageSmoothingEnabled = false;
}
