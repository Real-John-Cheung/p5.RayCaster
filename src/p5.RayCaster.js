import World from "./World";
import Camera from "./Camera";
import Sprite from "./Sprite";
import KeyboardControl from "./KeyboardControl";
import MouseControl from "./MouseControl";
import PointerLockControl from "./PointerLockControl";

/**
 * input should be pairs of number and p5.Image object
 * @param {number} blockType
 * @param {p5.Image} texture can also be p5.Graphics objects or a css string (single color)
 * @returns the texture map
 */
export function createTextureMap() {
    let map = new Map();
    for (let i = 0; i < arguments.length; i += 2) {
        const key = arguments[i];
        const value = arguments[i + 1];
        map.set(key, value);
    }
    return map
}

/**
 * create a skyBox object
 * 
 * @param {string} sky  a string notation of color or a p5.Image object
 * @param {string} ground a string notation of color or a p5.Image object
 * @param {p5.Image} [front = null] can be a p5.Graphics object
 * @param {p5.Image} [middle = null] can be a p5.Graphics object
 * @param {p5.Image} [back = null] a p5.Graphics object
 * @returns a skyBox object 
 */
export function createSkyBox(sky, ground, front = null, middle = null, back = null) {
    return {
        sky: sky,
        ground: ground,
        front: front,
        middle: middle,
        back: back
    }
}

/**
 * create a World object
 * 
 * @param {number} width integer indicating the width of the world (number of block)
 * @param {number} height integer indicating the height of the world (number of block)
 * @param {string} [data] block data for the world, e.g. "0,1,0,0,0,0,1,2,0,0,0,0...", can be an array of integer instead]
 * @param {Map} [textureMap] [[0, texture], [1, texture], ...]
 * @param {object} [skyBox] sky box
 * @param {string} skyBox.sky a string notation of color or a p5.Image object
 * @param {string} skyBox.ground a string notation of color or a p5.Image object
 * @param {p5.Image} [skyBox.front] can be a p5.Graphics object
 * @param {p5.Image} [skyBox.middle] can be a p5.Graphics object
 * @param {p5.Image} [skyBox.back] can be a p5.Graphics object
 * @param {object} [typeTable] block type table to interpret the data, default to the default table
 * @param {object} [options] 
 * @param {number} options.doorSpeed how fast the door open and close, default to 0.01;
 * @param {boolean} options.doorAutoClose will the door close by it self, default to false;
 * @param {number} options.doorClosingTime if doorAutoClose is true, define how long the door will be open
 *
 * @returns a new World object
 */
export function createWorld(width, height, data, textureMap, skyBox, typeTable, options) {
    return new World(width, height, data, textureMap, skyBox, typeTable, options);
}

/**
 * 
 * @param {p5.Image} spriteSourceImage 
 * @param {Vector} position {x, y} or a p5.Vector object
 * @param {number} width 
 * @param {number} height 
 * @param {number} [angle] optional
 * @param {number} [yAdjustment] optional  [-0.5, 0.5] -0.5 ~ 0.5, negative number will make the sprite appear lower and positive number will make it appear higher
 * @param {number} [animationGap] optional  number of frame for before change to the next animation
 * @param {p5} [p5Inst] optional, needed when using p5 instance mode 
 * 
 * @returns a Sprite object
 */
export function createSprite(spriteSourceImage, position, width, height, angle, yAdjustment, animationGap, p5Inst) {
    return new Sprite(spriteSourceImage, position, width, height, angle, yAdjustment, animationGap, p5Inst);
}

/**
 * 
 * @param {Vector} pos camera position, {x,y} or a p5.Vector object
 * @param {Vector} dir camera facing direction, {x,y} or a p5.Vector object, should be normalized
 * @param {number} fov field of view of the camera
 * @param {World} [world] the world that the camera attached to
 * @param {P5.Renderer} [canvas] the canvas that the camera render to, can be the main canvas or a p5.Graphics object
 * @returns a new camera object
 */
export function createCamera(pos, dir, fov, world, canvas) {
    return new Camera(pos, dir, fov, world, canvas);
}

/**
 * 
 * @param {object} [keyMap]
 * @returns a new keyboard control object
 */
export function initKeyboardControl(keyMap) {
    return new KeyboardControl(keyMap);
}

/**
 * 
 * @param {HTMLElement} [ele] element that the controller binds to
 * @returns a new mouse control object
 */
export function initMouseControl(ele){
    return new MouseControl(ele)
}

/**
 * 
 * @param {Camera} camera the camera to be controlled
 * @param {HTMLElement} ele element that the controller binds to
 * @returns a new pointerlock control object
 */
export function initPointerLockControl(camera, ele){
    return new PointerLockControl(camera, ele)
}