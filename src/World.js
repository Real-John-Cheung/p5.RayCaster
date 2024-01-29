import Sprite from "./Sprite";
class World {
    static defaultTypeTable = {
        MAP_FLOOR: 0,
        MAP_WALL: 1,
        MAP_WALL_SHADOW: 2,
        MAP_DOOR: 3,
        MAP_DOOR_FRAME: 4,
        MAP_PUSH_WALL: 5,
        MAP_CIRCULAR_COLUMN: 6,
        MAP_DIA_WALL_TR_BL: 7,
        MAP_DIA_WALL_TL_BR: 8,
        MAP_TRANSPARENT_WALL: 9,
        DOOR_CLOSED: 0,
        DOOR_OPENING: 1,
        DOOR_OPEN: 2,
        DOOR_CLOSING: 3,
    }

    static defaultSkyBox = {
        sky: "black",
        ground: "grey",
        front: null,
        middle: null,
        back: null,
    }

    /**
     * 
     * @param {number} [width = 24] integer indicating the width of the world (number of block)
     * @param {number} [height = 24] integer indicating the height of the world (number of block)
     * @param {string} [data=null] block data for the world, e.g. "0,1,0,0,0,0,1,2,0,0,0,0...", can be an array of integer instead]
     * @param {Map} [textureMap=null] [[0, texture], [1, texture], ...]
     * @param {object} [skyBox=World.defaultSkyBox] sky box
     * @param {string} skyBox.sky a string notation of color or a p5.Image object
     * @param {string} skyBox.ground a string notation of color or a p5.Image object
     * @param {p5.Image} skyBox.front can be a p5.Graphics object
     * @param {p5.Image} skyBox.middle can be a p5.Graphics object
     * @param {p5.Image} skyBox.back can be a p5.Graphics object
     * @param {object} [typeTable = World.defaultTypeTable] block type table to interpret the data, default to the default table
     * @param {object} [options=null]
     * @param {number} options.doorSpeed how fast the door open and close, default to 0.01;
     * @param {boolean} options.doorAutoClose will the door close by it self, default to false;
     * @param {number} options.doorClosingTime if doorAutoClose is true, define how long the door will be open
     */
    constructor(width = 24, height = 24, data = null, textureMap = null, skyBox = World.defaultSkyBox, typeTable = World.defaultTypeTable, options = null) {
        this.width = width;
        this.height = height;
        this.map = new Array(this.width * this.height).fill(0);
        this.table = typeTable;
        this.skyBox = skyBox;
        this.sprites = [];
        this.cameras = [];
        this.textureMap = textureMap;
        this.loadMap(data, options);
    }

    /**
     * 
     * @param {string} data block data for the world separated by comma, can be an array of integer instead
     * @param {object} [options = null]
     * @param {number} options.doorSpeed how fast the door open and close, default to 0.1;
     * @param {boolean} options.doorAutoClose will the door close by it self, default to false;
     * @param {number} options.doorClosingTime if doorAutoClose is true, define how long the door will be open
     */
    loadMap(data, options) {
        if (data && data.length) {
            if (typeof data === "string") {
                data.split(',').forEach((b, i) => { 
                    this.map[i] = parseInt(b);
                    if (this.map[i] % 10 === this.table.MAP_WALL_SHADOW) {
                        console.warn(`[p5RayCaster]: MAP_WALL_SHADOW ${this.map[i]} should not be used in the map, changed to MAP_WALL ${Math.floor(this.map[i] / 10) + this.table.MAP_WALL}`);
                        this.map[i] = Math.floor(this.map[i] / 10) + this.table.MAP_WALL;
                    }
                });
            } else if (typeof data[0] === "number") {
                data.forEach((b, i) => { 
                    this.map[i] = b;
                    if (this.map[i] % 10 === this.table.MAP_WALL_SHADOW) {
                        console.warn(`[p5RayCaster]: MAP_WALL_SHADOW ${this.map[i]} should not be used in the map, changed to MAP_WALL ${Math.floor(this.map[i] / 10) + this.table.MAP_WALL}`);
                        this.map[i] = Math.floor(this.map[i] / 10) + this.table.MAP_WALL;
                    }
                 });
            } else if (typeof data[0][0] === "number") {
                for (let y = 0; y < data.length; y++) {
                    for (let x = 0; x < data[y].length; x++) {
                        let idx = x + y * this.width;
                        this.map[idx] = data[y][x];
                        if (this.map[idx] % 10 === this.table.MAP_WALL_SHADOW) {
                            console.warn(`[p5RayCaster]: MAP_WALL_SHADOW ${this.map[idx]} should not be used in the map, changed to MAP_WALL ${Math.floor(this.map[idx] / 10) + this.table.MAP_WALL}`);
                            this.map[idx] = Math.floor(this.map[idx] / 10) + this.table.MAP_WALL;
                        }
                    }
                }
            }
        }
        this.doorOffsets = new Array(this.width * this.height).fill(0);
        this.doorStates = new Array(this.width * this.height).fill(0);
        this.doorSpeed = options && options.doorSpeed ? options.doorSpeed : 0.1;
        this.doorAutoClose = options && options.doorAutoClose ? options.doorAutoClose : false;
        this.doorClosingTime = options && options.doorClosingTime ? options.doorClosingTime : 0;
    }

    /**
     * this function will not copy the Map
     * @param {Map} textureMap 
     */
    loadTextureMap(textureMap) {
        this.textureMap = textureMap;
    }

    /**
     * add a sprite to the world
     * @param {Sprite} sprite 
     */
    addSprite(sprite) {
        this.sprites.push(sprite);
        sprite.world = this;
        this.cameras.forEach((c) => {
            c.updateSpritesBuffers();
        })
    }

    /**
     * remove a sprite
     * @param {number} spriteIdx index of the sprite in the sprites array or the sprite itself
     */
    removeSprite(spriteIdx) {
        if (spriteIdx instanceof Sprite) {
            delete spriteIdx.world
            let idx = this.sprites.indexOf(spriteIdx)
            if (idx === -1) {
                console.warn("invalid remove: sprite is not in the world");
                return;
            }
            spriteIdx = idx;
        }
        delete this.sprites[spriteIdx].world;
        this.sprites.splice(spriteIdx, 1);
        this.cameras.forEach((c) => {
            c.updateSpritesBuffers();
        })
    }

    /**
     * update the state of the doors and push walls
     * @param {number} [frameRate=30]
     */
    update(frameRate = 30) {
        const deltaTime = 1 / frameRate;
        for (let i = 0; i < this.map.length; i++) {
            const block = this.map[i];
            if (block === this.table.MAP_DOOR) {
                if (this.doorStates[i] === this.table.DOOR_OPENING) {
                    this.doorOffsets[i] += deltaTime * this.doorSpeed;
                    if (this.doorOffsets[i] > 1) {
                        this.doorOffsets[i] = 1;
                        this.doorStates[i] = this.table.DOOR_OPEN;
                        if (this.doorAutoClose) {
                            setTimeout((i) => { this.doorStates[i] = this.table.DOOR_CLOSING }, this.doorClosingTime, i);
                        }
                    }
                } else if (this.doorStates[i] === this.table.DOOR_CLOSING) {
                    this.doorOffsets[i] -= deltaTime * this.doorSpeed;
                    if (this.doorOffsets[i] < 0) {
                        this.doorOffsets[i] = 0;
                        this.doorStates[i] = this.table.DOOR_CLOSED;
                    }
                }
            } else if (block === this.table.MAP_PUSH_WALL) {
                if (this.doorStates[i] === this.table.DOOR_OPENING) {
                    this.doorOffsets[i] += deltaTime * this.doorSpeed;
                    if (this.doorOffsets[i] > 1) {
                        this.doorOffsets[i] = 1;
                        this.doorStates[i] = this.table.DOOR_OPEN;
                    }
                }
            }
        }
    }

    /**
     * 
     * @param {number} x x coordinate of the block
     * @param {number} y y coordinate of the block
     */
    openDoor(x, y) {
        let idx = arguments.length === 1 ? x : x + y * this.width;
        if (this.map[idx] === this.table.MAP_DOOR || this.map[idx] === this.table.MAP_PUSH_WALL) {
            if (this.doorStates[idx] === this.table.DOOR_CLOSED) {
                this.doorStates[idx] = this.table.DOOR_OPENING;
            }
        }
    }

    /**
     * 
     * @param {number} x x coordinate of the block
     * @param {number} y y coordinate of the block
     */
    closeDoor(x, y) {
        let idx = arguments.length === 1 ? x : x + y * this.width;
        if (this.map[idx] === this.table.MAP_DOOR) {
            if (this.doorStates[idx] === this.table.DOOR_OPEN) {
                this.doorStates[idx] = this.table.DOOR_CLOSING;
            }
        }
    }

     /**
     * 
     * @param {number} x x coordinate of the block
     * @param {number} y y coordinate of the block
     */
    moveDoor(x, y) {
        let idx = arguments.length === 1 ? x : x + y * this.width;
        if (this.map[idx] === this.table.MAP_DOOR) {
            if (this.doorStates[idx] === this.table.DOOR_OPEN) {
                this.doorStates[idx] = this.table.DOOR_CLOSING;
            } else if (this.doorStates[idx] === this.table.DOOR_CLOSED) {
                this.doorStates[idx] = this.table.DOOR_OPENING;
            }
        }

        if (this.map[idx] === this.table.MAP_PUSH_WALL) {
            if (this.doorStates[idx] === this.table.DOOR_CLOSED) {
                this.doorStates[idx] = this.table.DOOR_OPENING;
            }
        }
    }
}

export default World