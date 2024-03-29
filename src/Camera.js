import TransparentWall from "./TransparentWall";
import Util from "./Util";
import World from "./World";
/**
 * class for camera 
 */
class Camera {

    static defaultMiniMapOptions = {
        border: {
            stroke: "white",
            strokeWeight: 3,
        },
        background: {
            fill: "grey"
        },
        sprite: {
            fill: "purple",
            stroke: undefined,
            strokeWeight: 0,
            dia: .5
        },
        camera: {
            fill: "yellow",
            stroke: undefined,
            strokeWeight: 0,
            dia: .5
        },
        fov: {
            stroke: "black",
            strokeWeight: 1,
        },
        blocks: new Map([
            [0, {}],
            [1, { fill: "red" }],
            [3, { fill: "blue" }],
            [4, { fill: "blue" }],
            [5, { fill: "red", stroke: "blue", strokeWeight: 1}],
            [6, { fill: "cyan" }],
            [7, { stroke: "red", strokeWeight: 3 }],
            [8, { stroke: "red",  strokeWeight: 3}],
            [9, { fill: "rgba(255,0,0,0.25)" }]
        ]),
        MAP_FLOOR: {
            fill: undefined,
            stroke: undefined,
            strokeWeight: 0,
        },
        MAP_WALL: {
            fill: "red",
            stroke: undefined,
            strokeWeight: 0,
        },
        MAP_DOOR: {
            fill: "blue",
            stroke: undefined,
            strokeWeight: 0,
        },
        MAP_DOOR_FRAME: {
            fill: "black",
            stroke: "blue",
            strokeWeight: 2,
        },
        MAP_PUSH_WALL: {
            fill: "red",
            stroke: "blue",
            strokeWeight: 1,
        },
        MAP_CIRCULAR_COLUMN: {
            fill: "cyan",
            stroke: undefined,
            strokeWeight: 0,
        },
        MAP_DIA_WALL_TR_BL: {
            fill: undefined,
            stroke: "red",
            strokeWeight: 3,
        },
        MAP_DIA_WALL_TL_BR: {
            fill: undefined,
            stroke: "red",
            strokeWeight: 3,
        },
        MAP_TRANSPARENT_WALL: {
            fill: "rgba(255,0,0,0.25)",
            stroke: undefined,
            strokeWeight: 0,
        }
    }
    /**
     * 
     * @param {Vector} pos {x,y} or a p5.Vector object
     * @param {Vector} dir {x,y} or a p5.Vector object, should be normalized
     * @param {number} fov 
     * @param {World} [world=null] world that the camera is in
     * @param {p5.Renderer} [canvas=null] the canvas this camera to draw on, can be the main p5 canvas or a p5.Graphics object
     */
    constructor(pos, dir, fov, world = null, canvas = null) {
        this.fov = fov;
        this.pos = { x: pos.x, y: pos.y };
        this.dir = Util.normalize(dir);
        this.tilting = 0;
        this.tiltingRange = [-Math.PI / 4, Math.PI / 4]
        this.plane = Util.rotateVector(this.dir, -Math.PI / 2);
        this.plane.x = this.plane.x * fov;
        this.plane.y = this.plane.y * fov;
        this.attachToWorld(world);
        this.canvas = canvas;
        if (this.canvas !== null) {
            this.cameraXCoords = [];
            for (let x = 0; x < this.canvas.width; x++) {
                this.cameraXCoords.push(2 * x / this.canvas.width - 1);
            }
        }
        this.zBuffer = canvas ? new Array(canvas.width) : [];
        this.spritesOrderBuffer = [];
        this.spritesDistanceBuffer = [];
        this.spritesUpdateGap = 4; // frame
        if (world !== null) this.updateSpritesBuffers();
        //minimap render options
        this.miniMapOptions = Camera.defaultMiniMapOptions;
    }

    /**
     * 
     * @param {World} world the world to attach the camera
     */
    attachToWorld(world) {
        this.world = world;
        if (world !== null) world.cameras.push(this);
    }

    /**
     * remove the camera to the attached world
     */
    removeFromWorld() {
        this.world.camera.splice(this.world.cameras.indexOf(this), 1);
        this.world = null;
    }

    updateSpritesBuffers() {
        if (this.world === null || this.world.sprites.length < 1) return;
        const sprites = this.world.sprites
        for (let i = 0; i < sprites.length; i++) {
            this.spritesOrderBuffer[i] = i;
            this.spritesDistanceBuffer[i] = (this.pos.x - sprites[i].pos.x) * (this.pos.x - sprites[i].pos.x) + (this.pos.y - sprites[i].pos.y) * (this.pos.y - sprites[i].pos.y);
        }
        Util.combineSort(this.spritesOrderBuffer, this.spritesDistanceBuffer, sprites.length);
    }

    /**
   * set the option on how the minimap should be rendered
   * this function will not copy the options object
   * for all the options see the miniMapOption section on readme.md
   * @param {object} options 
   */
    setMiniMapRenderOptions(options) {
        this.miniMapOptions = options;
    }


    /**
     * teleport the camera to somewhere
     * @param {Vector} point {x,y} or a p5.Vector object
     * @param {Vector} dir {x,y} or a p5.Vector object, optional
     * @param {World} [world = null] optional
     */
    teleportTo(point, dir, world = null) {
        this.pos.x = point.x;
        this.pos.y = point.y;
        if (dir) {
            dir = Util.normalize(dir);
            this.dir.x = dir.x;
            this.dir.y = dir.y;
            this.plane = Util.rotateVector(this.dir, -Math.PI / 2);
            this.plane.x = this.plane.x * this.fov;
            this.plane.y = this.plane.y * this.fov;
        }
        if (world && world !== null) {
            this.removeFromWorld();
            this.attachToWorld(world);
        }
    }

    /**
     * move the camera in the world
     * @param {Vector} movement {x,y} or a p5.Vector object
     */
    move(movement) {
        if (this.world === null) throw new Error("world should be set before manipulating camera");
        let idx1 = Math.floor(this.pos.x + movement.x) + Math.floor(this.pos.y) * this.world.width;
        let idx2 = Math.floor(this.pos.x) + Math.floor(this.pos.y + movement.y) * this.world.width;
        if (this.world.map[idx1] === this.world.table.MAP_FLOOR || this.world.doorStates[idx1] === this.world.table.DOOR_OPEN) {
            if (Math.floor(this.pos.x + movement.x) > -1 && Math.floor(this.pos.x + movement.x) < this.world.width) this.pos.x += movement.x; // can't go out sdie the world

        }
        if (this.world.map[idx2] === this.world.table.MAP_FLOOR || this.world.doorStates[idx2] === this.world.table.DOOR_OPEN) {
            if (Math.floor(this.pos.y + movement.y) > -1 && Math.floor(this.pos.y + movement.y) < this.world.height) this.pos.y += movement.y;
        }
    }

    /**
     * rotate the camera by an angle
     * @param {number} angle 
     */
    rotate(angle) {
        this.dir = Util.rotateVector(this.dir, angle);
        this.plane = Util.rotateVector(this.plane, angle);
    }

    /**
     * tile the camera
     * @param {number} angle 
     * 
     */
    tilt(angle) {
        this.tilting += angle;
        if (this.tilting > this.tiltingRange[1]) this.tilting = this.tiltingRange[1];
        if (this.tilting < this.tiltingRange[0]) this.tilting = this.tiltingRange[0];
    }

    /**
     * 
     * @param {number} min 
     * @param {number} max 
     */
    updateTiltingRange(min, max) {
        this.tiltingRange[0] = min;
        this.tiltingRange[1] = max;
    }

    /**
     * open the door (or push wall) the camera facing
     */
    openDoor() {
        let checkMapX = Math.floor(this.pos.x + this.dir.x);
        let checkMapY = Math.floor(this.pos.y + this.dir.y);
        let checkMapX2 = Math.floor(this.pos.x + this.dir.x * 2);
        let checkMapY2 = Math.floor(this.pos.y + this.dir.y * 2);
        let idx1 = checkMapX + checkMapY * this.world.width;
        let idx2 = checkMapX2 + checkMapY2 * this.world.width;
        this.world.openDoor(idx1);
        this.world.openDoor(idx2);
        let idx3 = Math.floor(this.pos.x) + Math.floor(this.pos.y) * this.world.width;
        if (this.world.map[idx3] === this.world.table.MAP_DOOR) {
            this.world.doorStates[idx3] = this.world.table.DOOR_OPENING;
        }
    }

    /**
     * close the door the camera facing
     */
    closeDoor() {
        let checkMapX = Math.floor(this.pos.x + this.dir.x);
        let checkMapY = Math.floor(this.pos.y + this.dir.y);
        let checkMapX2 = Math.floor(this.pos.x + this.dir.x * 2);
        let checkMapY2 = Math.floor(this.pos.y + this.dir.y * 2);
        let idx1 = checkMapX + checkMapY * this.world.width;
        let idx2 = checkMapX2 + checkMapY2 * this.world.width;
        this.world.closeDoor(idx1);
        this.world.closeDoor(idx2);
        let idx3 = Math.floor(this.pos.x) + Math.floor(this.pos.y) * this.world.width;
        if (this.world.map[idx3] === this.world.table.MAP_DOOR) {
            this.world.doorStates[idx3] = this.world.table.DOOR_OPENING;
        }
    }

    /**
     * move the door the camera facing
     */
    moveDoor() {
        let checkMapX = Math.floor(this.pos.x + this.dir.x);
        let checkMapY = Math.floor(this.pos.y + this.dir.y);
        let checkMapX2 = Math.floor(this.pos.x + this.dir.x * 2);
        let checkMapY2 = Math.floor(this.pos.y + this.dir.y * 2);
        let idx1 = checkMapX + checkMapY * this.world.width;
        let idx2 = checkMapX2 + checkMapY2 * this.world.width;
        this.world.moveDoor(idx1);
        this.world.moveDoor(idx2);
        let idx3 = Math.floor(this.pos.x) + Math.floor(this.pos.y) * this.world.width;
        if (this.world.map[idx3] === this.world.table.MAP_DOOR) {
            this.world.doorStates[idx3] = this.world.table.DOOR_OPENING;
        }
    }

    /**
     * minimap will always center around current camera position
     * @param {Vector} size how many block around camera to be drawn {x:on left and right, y: on top and button}
     * @param {number} canvasX where to draw the minimap on canvas
     * @param {number} canvasY where to draw the minimap on canvas
     * @param {number} renderWidth size of the minimap on canvas
     * @param {number} renderHeight size of the minimap on canvas
     * @param {p5.Renderer} [canvas=this.canvas] a p5.Renderer (for main canvas) or p5.Graphics
     */
    renderMiniMap(size, canvasX, canvasY, renderWidth, renderHeight, canvas = this.canvas) {
        const p = canvas._isMainCanvas ? canvas._pInst : canvas;
        let camBlock = { x: Math.floor(this.pos.x), y: Math.floor(this.pos.y) };
        let mapMulti = { x: renderWidth / (size.x * 2 + 1), y: renderHeight / (size.y * 2 + 1) };
        p.push();
        //background
        p.fill(this.miniMapOptions.background.fill);
        p.rect(canvasX, canvasY, renderWidth, renderHeight);

        //blocks
        for (let x = 0; x < size.x * 2 + 1; x++) {
            for (let y = 0; y < size.y * 2 + 1; y++) {
                let mx = camBlock.x - size.x + x;
                let my = camBlock.y - size.y + y;
                if (mx < 0 || mx > this.world.width - 1 || my < 0 || my > this.world.height - 1) continue;
                let idx = mx + my * this.world.width;
                let xx = canvasX + renderWidth - ((x + 1) * mapMulti.x);
                let yy = canvasY + y * mapMulti.y;
                //TODO: redo this mess
                if (this.miniMapOptions.blocks.has(this.world.map[idx])) {
                    let ttt = this.miniMapOptions.blocks.get((this.world.map[idx]));
                    if (ttt.icon){
                        p.image(ttt.icon, xx, yy, mapMulti.x, mapMulti.y);
                    } else {
                        ttt.fill ? p.fill(ttt.fill) : p.noFill();
                        if (ttt.stroke){
                            p.stroke(ttt.stroke);
                            if (ttt.strokeWeight) p.strokeWeight(ttt.strokeWeight);
                        } else {
                            p.noStroke();
                        }
                        switch(this.world.map[idx] % 10){
                            default:
                                p.rect(xx, yy, mapMulti.x, mapMulti.y);
                                break;
                            case this.world.table.MAP_DIA_WALL_TR_BL:
                                p.line(xx, yy, xx + mapMulti.x, yy + mapMulti.y);
                                break;
                            case this.world.table.MAP_DIA_WALL_TL_BR:
                                p.line(xx + mapMulti.x, yy, xx, yy + mapMulti.y);
                                break;
                            case this.world.table.MAP_CIRCULAR_COLUMN:
                                p.ellipse(xx + mapMulti.x / 2, yy + mapMulti.y / 2, mapMulti.x, mapMulti.y);
                                break;
                        }
                    }
                } else {
                    let ttt;
                    switch (this.world.map[idx] % 10) {
                        case this.world.table.MAP_FLOOR:
                            ttt = this.miniMapOptions.MAP_FLOOR;
                            break;
                        case this.world.table.MAP_WALL:
                            ttt = this.miniMapOptions.MAP_WALL;
                            break;
                        case this.world.table.MAP_WALL_SHADOW:
                            ttt = this.miniMapOptions.MAP_WALL;
                            break;
                        case this.world.table.MAP_DOOR:
                            ttt = this.miniMapOptions.MAP_DOOR;
                            break;
                        case this.world.table.MAP_DOOR_FRAME:
                            ttt = this.miniMapOptions.MAP_DOOR_FRAME;
                            break;
                        case this.world.table.MAP_PUSH_WALL:
                            ttt = this.miniMapOptions.MAP_PUSH_WALL
                            break;
                        case this.world.table.MAP_CIRCULAR_COLUMN:
                            ttt = this.miniMapOptions.MAP_CIRCULAR_COLUMN;
                            break;
                        case this.world.table.MAP_DIA_WALL_TR_BL:
                            ttt = this.miniMapOptions.MAP_DIA_WALL_TR_BL;
                            break;
                        case this.world.table.MAP_DIA_WALL_TL_BR:
                            ttt = this.miniMapOptions.MAP_DIA_WALL_TL_BR;
                            break;
                        case this.world.table.MAP_TRANSPARENT_WALL:
                            ttt = this.miniMapOptions.MAP_TRANSPARENT_WALL
                            break;
                        default:
                            break;
                    }
                    if (ttt.icon){
                        p.image(ttt.icon, xx, yy, mapMulti.x, mapMulti.y);
                    } else {
                        ttt.fill ? p.fill(ttt.fill) : p.noFill();
                        if (ttt.stroke){
                            p.stroke(ttt.stroke);
                            if (ttt.strokeWeight) p.strokeWeight(ttt.strokeWeight);
                        } else {
                            p.noStroke();
                        }
                        switch(this.world.map[idx] % 10){
                            default:
                                p.rect(xx, yy, mapMulti.x, mapMulti.y);
                                break;
                            case this.world.table.MAP_DIA_WALL_TR_BL:
                                p.line(xx, yy, xx + mapMulti.x, yy + mapMulti.y);
                                break;
                            case this.world.table.MAP_DIA_WALL_TL_BR:
                                p.line(xx + mapMulti.x, yy, xx, yy + mapMulti.y);
                                break;
                            case this.world.table.MAP_CIRCULAR_COLUMN:
                                p.ellipse(xx + mapMulti.x / 2, yy + mapMulti.y / 2, mapMulti.x, mapMulti.y);
                                break;
                        }
                    }
                }
            }
        }

        //cam
        let camX = canvasX + renderWidth - ((this.pos.x - Math.floor(this.pos.x)) + size.x) * mapMulti.x;
        let camY = canvasY + ((this.pos.y - Math.floor(this.pos.y)) + size.y) * mapMulti.y;
        this.miniMapOptions.camera.fill ? p.fill(this.miniMapOptions.camera.fill) : p.noFill();
        if (this.miniMapOptions.camera.stroke) {
            p.stroke(this.miniMapOptions.camera.stroke);
            if (this.miniMapOptions.camera.strokeWeight) p.strokeWeight(this.miniMapOptions.camera.strokeWeight);
        } else {
            p.noStroke();
        }
        p.ellipse(camX, camY, this.miniMapOptions.camera.dia * mapMulti.x, this.miniMapOptions.camera.dia * mapMulti.y);

        //fov
        if (this.miniMapOptions.fov.stroke) {
            p.stroke(this.miniMapOptions.fov.stroke);
            if (this.miniMapOptions.fov.strokeWeight) p.strokeWeight(this.miniMapOptions.fov.strokeWeight);
            p.line(camX, camY, camX - (this.dir.x + this.plane.x) * mapMulti.x, camY + (this.dir.y + this.plane.y) * mapMulti.y);
            p.line(camX, camY, camX - (this.dir.x - this.plane.x) * mapMulti.x, camY + (this.dir.y - this.plane.y) * mapMulti.y);
        }

        //sprite
        this.miniMapOptions.sprite.fill ? p.fill(this.miniMapOptions.sprite.fill) : p.noFill();
        if (this.miniMapOptions.sprite.stroke) {
            p.stroke(this.miniMapOptions.sprite.stroke);
            if (this.miniMapOptions.sprite.strokeWeight) p.strokeWeight(this.miniMapOptions.sprite.strokeWeight);
        } else {
            p.noStroke();
        }
        this.world.sprites.forEach(sp => {
            if (sp.pos.x > camBlock.x - size.x && sp.pos.x < camBlock.x + size.x && sp.pos.y > camBlock.y - size.y && sp.pos.y < camBlock.y + size.y) {
                let xxx = canvasX + renderWidth - (sp.pos.x - (camBlock.x - size.x)) * mapMulti.x;
                let yyy = canvasY + (sp.pos.y - (camBlock.y - size.y)) * mapMulti.y;
                p.ellipse(xxx, yyy, this.miniMapOptions.sprite.dia * mapMulti.x, this.miniMapOptions.sprite.dia * mapMulti.y);
            }
        });
        p.pop();
    }

    /**
     * render sky box
     * @param {boolean} [sky=true] if true, render sky
     * @param {boolean} [ground=true] if true, render ground 
     * @param {p5.Renderer} [canvas=this.canvas] a p5.Renderer (for main canvas) or p5.Graphics
     */
    renderSkyBox(sky = true, ground = true, canvas = this.canvas) {
        if (!sky && ! ground) return;
        const verticalAdjustment = Math.tan(this.tilting);
        const skyPortion = 0.5 + verticalAdjustment;
        const groundPortion = 1 - skyPortion;
        const p = canvas._isMainCanvas ? canvas._pInst : canvas;
        const skyBox = this.world.skyBox;
        p.push();
        if (sky) {
            if (typeof skyBox.sky === "string") {
                p.fill(skyBox.sky);
                p.noStroke();
                p.rect(0, 0, p.width, p.height * skyPortion);
            } else {
                let img = skyBox.sky
                p.image(img, 0, 0, p.width, p.height * skyPortion, 0, img.height - p.height * skyPortion, p.width, p.height * skyPortion);
            }
            if (skyBox.back || skyBox.front || skyBox.middle) {
                let deltaX = this.world.width / 2 - this.pos.x;
                let deltaY = this.world.height / 2 - this.pos.y;
                let rvX = (this.world.width / 2) * this.dir.x;
                let rvY = (this.world.height / 2) * this.dir.y;
                let edgeVector = { x: rvX + deltaX, y: rvY + deltaY };
                let edge = { x: this.pos.x + edgeVector.x, y: this.pos.y + edgeVector.y };
                let distFromEdge = Math.sqrt((edge.x - this.pos.x) * (edge.x - this.pos.x) + (edge.y - this.pos.y) * (edge.y - this.pos.y));
                let dist2 = distFromEdge + distFromEdge;
    
                let dirOffset = (Math.atan2(this.dir.y, this.dir.x) + Math.PI) / Math.PI; // offset of the sky box;
                let foreOffset = Math.floor(dirOffset * p.width);
                let midOffset = Math.floor(foreOffset / 1.5);
                let backOffset = Math.floor(foreOffset / 2);
                let skyH = p.height * skyPortion;
                if (skyBox.back) {
                    let backWidth = p.width / 2;
                    let backHeight = skyH / 2;
                    p.image(skyBox.back, backOffset, backHeight, backWidth, backHeight, 0, skyH - skyBox.back.height, skyBox.back.width, skyBox.back.height);
                    p.image(skyBox.back, backOffset - backWidth, backHeight, backWidth, backHeight, 0, skyH - skyBox.back.height, skyBox.back.width, skyBox.back.height);
                    if (dirOffset > 1) {
                        p.image(skyBox.back, backOffset - p.width, backHeight, backWidth, backHeight, 0, skyH - skyBox.back.height, skyBox.back.width, skyBox.back.height);
                    }
                    if (dirOffset < 1) {
                        p.image(skyBox.background, backOffset + backWidth, backHeight, backWidth, backHeight, 0, skyH - skyBox.background.height, skyBox.background.width, skyBox.background.height);
                    }
                }
                if (skyBox.middle) {
                    let midWidth = p.width / 1.5;
                    let midHeight = skyH / 1.5;
                    let midYPos = (skyH / 3 - this.world.width) + distFromEdge;
                    p.image(skyBox.middle, midOffset - midWidth, midYPos, midWidth, midHeight, 0, skyH - skyBox.middle.height, skyBox.middle.width, skyBox.middle.height)
                    if (dirOffset < 1.5) {
                        p.image(skyBox.middle, midOffset, midYPos, midWidth, midHeight, 0, skyH - skyBox.middle.height, skyBox.middle.width, skyBox.middle.height);
                    }
                    if (dirOffset < 0.5) {
                        p.image(skyBox.middle, midOffset + midWidth, midYPos, midWidth, midHeight, 0, skyH - skyBox.middle.height, skyBox.middle.width, skyBox.middle.height)
                    }
                    if (dirOffset > 1) {
                        p.image(skyBox.middle, midOffset - midWidth * 2, midYPos, midWidth, midHeight, 0, skyH - skyBox.middle.height, skyBox.middle.width, skyBox.middle.height)
                    }
                }
                if (skyBox.front) {
                    p.image(skyBox.front, foreOffset - p.width, (- this.world.width * 2) + dist2, p.width, skyH, 0, skyH - skyBox.front.height, skyBox.front.width, skyBox.front.height)
                    if (dirOffset < 1) {
                        p.image(skyBox.front, foreOffset, (- this.world.width * 2) + dist2, p.width, skyH, 0, skyH - skyBox.front.height, skyBox.front.width, skyBox.front.height)
                    }
                    if (dirOffset > 1) {
                        p.image(skyBox.front, foreOffset - p.width * 2, (- this.world.width * 2) + dist2, p.width, skyH, 0, skyH - skyBox.front.height, skyBox.front.width, skyBox.front.height)
    
                    }
                }
            }
        }
        if (ground) {
            if (typeof skyBox.ground === "string") {
                p.fill(skyBox.ground);
                p.noStroke();
                p.rect(0, p.height * skyPortion, p.width, p.height * groundPortion);
            } else {
                let img = skyBox.sky
                p.image(img, 0, p.height * skyPortion, p.width, p.height * groundPortion, 0, img.height - p.height * groundPortion, p.width, p.height * groundPortion);
            }
        }
        p.pop();
    }

    /**
     * 
     * @param {boolean} [floor = true] render ray casting floor ? 
     * @param {boolean} [ceiling = true] render ray casting ceiling?
     * @param {p5.Renderer} [canvas=this.canvas] a p5.Renderer (for main canvas) or p5.Graphics
     */
    renderFloorAndCeiling( floor = true, ceiling = true, canvas=this.canvas){
        const p = canvas._isMainCanvas ? canvas._pInst : canvas;
        if (!(p.pixels && p.pixels.length > 0)) p.loadPixels();
        const verticalAdjustment = Math.tan(this.tilting);
        const d =p.pixelDensity();
        for (let y = 0; y < p.height; y++) {
            let delta = y - (0.5 + verticalAdjustment) * p.height; // distance from horizon
            if (delta === 0) continue;
            if (!floor && delta > 0) return;
            if (!ceiling && delta < 0) continue;

            let rayDir0 = {x: this.dir.x - this.plane.x, y: this.dir.y - this.plane.y};
            let rayDir1 = {x: this.dir.x + this.plane.x, y: this.dir.y + this.plane.y};
            
            let rowDistance = (0.5 * p.height) / (delta);    
            let stepX = rowDistance * (rayDir1.x - rayDir0.x) / p.width;
            let stepY = rowDistance * (rayDir1.y - rayDir0.y) / p.width;
            let xx = this.pos.x + rowDistance * rayDir0.x;
            let yy = this.pos.y + rowDistance * rayDir0.y;
            for (let x = 0; x < p.width; x++) {
                let blockX = Math.floor(xx);
                let blockY = Math.floor(yy);
                let blockIdx = blockX + blockY * this.world.width;
                let blockN; 
                if (delta > 0) {
                    blockN = typeof this.world.floor === "number" ? this.world.floor : this.world.floor[blockIdx];
                } else {
                    blockN = typeof this.world.ceiling === "number" ? this.world.ceiling : this.world.ceiling[blockIdx];
                }
                let tex = this.world.textureMap.get(blockN);
                let texX = Math.floor((xx - blockX) * tex.width) & (tex.width - 1);
                let texY = Math.floor((yy - blockY) * tex.height) & (tex.height - 1);
                if (!(tex.pixels && tex.pixels.length > 0)) tex.loadPixels();
                let texIdx = 4 * (texX + texY * tex.width);
                for(let i = 0; i < d; i ++) {
                    for (let j = 0; j < d; j++){
                      let index = 4 * ((y * d + j) * p.width * d + (x * d + i));
                      p.pixels[index] = tex.pixels[texIdx];
                      p.pixels[index + 1] = tex.pixels[texIdx + 1];
                      p.pixels[index + 2] = tex.pixels[texIdx + 2];
                      p.pixels[index + 3] = tex.pixels[texIdx + 3];
                    }
                  }
                xx += stepX;
                yy += stepY;
            }
        }
        p.updatePixels();
    }

    /**
     * render the ray casting content
     * @param {boolean} [noSprites = false] if true, do not render sprites
     * @param {p5.Renderer} [canvas=this.canvas] a p5.Renderer (for main canvas) or p5.Graphics
     */
    renderRayCasting(noSprites = false, canvas = this.canvas) {
        const MOVE_SPEED = 0.125;
        const TURN_SPEED = 0.03;
        const p = canvas._isMainCanvas ? canvas._pInst : canvas;
        const verticalAdjustment = Math.tan(this.tilting);
        p.push();
        let cameraXCoords = [], tpWalls = [];
        if (canvas === this.canvas) {
            cameraXCoords = this.cameraXCoords;
        } else {
            for (let x = 0; x < canvas.width; x++) {
                cameraXCoords.push(2 * x / canvas.width - 1);
            }
        }
        //wall
        for (let x = 0; x < canvas.width; x++) {
            let rayDir = {
                x: this.dir.x + this.plane.x * cameraXCoords[x],
                y: this.dir.y + this.plane.y * cameraXCoords[x]
            }
            let mapX = Math.floor(this.pos.x);
            let mapY = Math.floor(this.pos.y);
            let sideDistX, sideDistY;
            let deltaDistX = Math.abs(1 / rayDir.x);
            let deltaDistY = Math.abs(1 / rayDir.y);
            let perpWallDist, stepX, stepY;
            let hit = 0, side, wallOffset = { x: 0, y: 0 };
            if (rayDir.x < 0) {
                stepX = -1;
                sideDistX = (this.pos.x - mapX) * deltaDistX;
            } else {
                stepX = 1;
                sideDistX = (mapX + 1 - this.pos.x) * deltaDistX;
            }
            if (rayDir.y < 0) {
                stepY = -1;
                sideDistY = (this.pos.y - mapY) * deltaDistY;
            } else {
                stepY = 1;
                sideDistY = (mapY + 1 - this.pos.y) * deltaDistY;
            }
            let rayTex, angleSide;
            while (hit === 0) {
                if (sideDistX < sideDistY) {
                    sideDistX += deltaDistX;
                    mapX += stepX;
                    side = 0;
                } else {
                    sideDistY += deltaDistY;
                    mapY += stepY;
                    side = 1;
                }
                if (mapX < 0 || mapX > this.world.width || mapY < 0 || mapY > this.world.height) break;
                let idx = mapX + mapY * this.world.width;
                rayTex = this.world.map[idx];
                var wallX, angleSize;
                if (rayTex !== this.world.table.MAP_FLOOR) {
                    switch (rayTex % 10) {
                        case this.world.table.MAP_DOOR:
                            if (this.world.doorStates[idx] !== this.world.table.DOOR_OPEN) {
                                hit = 1;
                                if (side == 1) {
                                    wallOffset.y = 0.5 * stepY;
                                    perpWallDist = (mapY - this.pos.y + wallOffset.y + (1 - stepY) / 2) / rayDir.y;
                                    wallX = this.pos.x + perpWallDist * rayDir.x;
                                    wallX -= Math.floor(wallX);
                                    if (sideDistY - (deltaDistY / 2) < sideDistX) {
                                        if (1 - wallX <= this.world.doorOffsets[idx]) {
                                            hit = 0;
                                            wallOffset.y = 0;
                                        }
                                    } else {
                                        mapX += stepX;
                                        idx = mapX + mapY * this.world.width;
                                        side = 0;
                                        rayTex = Math.floor(rayTex / 10) + this.world.table.MAP_DOOR_FRAME;
                                        wallOffset.y = 0;
                                    }
                                } else {
                                    wallOffset.x = 0.5 * stepX;
                                    perpWallDist = (mapX - this.pos.x + wallOffset.x + (1 - stepX) / 2) / rayDir.x;
                                    wallX = this.pos.y + perpWallDist * rayDir.y;
                                    wallX -= Math.floor(wallX);
                                    if (sideDistX - (deltaDistX / 2) < sideDistY) {
                                        if (1 - wallX < this.world.doorStates[idx]) {
                                            hit = 0;
                                            wallOffset.x = 0;
                                        }
                                    } else {
                                        mapY += stepY;
                                        side = 1;
                                        rayTex = Math.floor(rayTex / 10) + this.world.table.MAP_DOOR_FRAME;
                                        wallOffset.x = 0;
                                    }
                                }
                            }
                            break;
                        case this.world.table.MAP_PUSH_WALL:
                            if (this.world.doorStates[idx] !== this.world.table.DOOR_OPEN) {
                                if (side == 1 && sideDistY - (deltaDistY * (1 - this.world.doorOffsets[idx])) < sideDistX) {
                                    hit = 1;
                                    wallOffset.y = this.world.doorOffsets[idx] * stepY;
                                } else if (side == 0 && sideDistX - (deltaDistX * (1 - this.world.doorOffsets[idx])) < sideDistY) {
                                    hit = 1;
                                    wallOffset.x = this.world.doorOffsets[idx] * stepX;
                                }
                            }
                            break;
                        case this.world.table.MAP_CIRCULAR_COLUMN:
                            let intersectDist = Util.lineCircleIntersection({ x: this.pos.x, y: this.pos.y }, { x: this.pos.x + rayDir.x, y: this.pos.y + rayDir.y }, { x: mapX + 0.5, y: mapY + 0.5 }, 0.5, true);
                            if (intersectDist) {
                                hit = 1;
                                side = 3;
                                let intersect = { x: this.pos.x + rayDir.x * intersectDist.b, y: this.pos.y + rayDir.y * intersectDist.b };
                                perpWallDist = ((intersect.x - this.pos.x + intersect.y - this.pos.y) / 2) / ((rayDir.x + rayDir.y) / 2);
                                wallX = Math.atan2(mapY + 0.5 - intersect.y, mapX + 0.5 - intersect.x) / (Math.PI * 2);
                                wallX += wallX;
                            }
                            break;
                        case this.world.table.MAP_DIA_WALL_TR_BL:
                            var wallX1 = mapX, wallY1 = mapY + 1, wallX2 = mapX + 1, wallY2 = mapY;
                            var intersect = Util.lineIntersection({ x: this.pos.x, y: this.pos.y }, { x: this.pos.x + rayDir.x, y: this.pos.y + rayDir.y }, { x: wallX1, y: wallY1 }, { x: wallX2, y: wallY2 }, false);
                            if (intersect && intersect.x >= mapX && intersect.x <= mapX + 1 && intersect.y >= mapY && intersect.y <= mapY + 1) {
                                if ((side == 1 && stepY < 0) || (side == 0 && stepX < 0)) angleSide = 1;
                                hit = 1;
                                side = 2;
                                perpWallDist = ((intersect.x - this.pos.x + intersect.y - this.pos.y) / 2) / ((rayDir.x + rayDir.y) / 2);
                            }
                            break;
                        case this.world.table.MAP_DIA_WALL_TL_BR:
                            wallX1 = mapX, wallY1 = mapY, wallX2 = mapX + 1, wallY2 = mapY + 1;
                            intersect = Util.lineIntersection({ x: this.pos.x, y: this.pos.y }, { x: this.pos.x + rayDir.x, y: this.pos.y + rayDir.y }, { x: wallX1, y: wallY1 }, { x: wallX2, y: wallY2 }, false);
                            if (intersect && intersect.x >= mapX && intersect.x <= mapX + 1 && intersect.y >= mapY && intersect.y <= mapY + 1) {
                                if ((side == 1 && stepY > 0) || (side == 0 && stepX < 0)) angleSide = 1;
                                hit = 1;
                                side = 2;
                                perpWallDist = ((intersect.x - this.pos.x + intersect.y - this.pos.y) / 2) / ((rayDir.x + rayDir.y) / 2);
                            }
                            break;
                        case this.world.table.MAP_TRANSPARENT_WALL:
                            if (side == 1) {
                                if (sideDistY - (deltaDistY / 2) < sideDistX) {
                                    let wallDefined = false;
                                    for (let i = 0; i < tpWalls.length; i++) {
                                        if (tpWalls[i].mapX === mapX && tpWalls[i].mapY === mapY) {
                                            tpWalls[i].screenX.push(x);
                                            wallDefined = true;
                                            break;
                                        }
                                    }
                                    if (!wallDefined) {
                                        tpWalls.push(new TransparentWall(this, mapX, mapY, side, x, rayTex));
                                    }
                                }
                            } else {
                                if (sideDistX - (deltaDistX / 2) < sideDistY) {
                                    let wallDefined = false;
                                    for (let i = 0; i < tpWalls.length; i++) {
                                        if (tpWalls[i].mapX === mapX && tpWalls[i].mapY === mapY) {
                                            tpWalls[i].screenX.push(x);
                                            wallDefined = true;
                                            break;
                                        }
                                    }
                                    if (!wallDefined) {
                                        tpWalls.push(new TransparentWall(this, mapX, mapY, side, x, rayTex));
                                    }
                                }
                            }
                            break;
                        case this.world.table.MAP_WALL_SHADOW:
                            if (side === 1 && this.world.map[mapX + (mapY - stepY) * this.world.width] === this.world.table.MAP_DOOR) rayTex = Math.floor(this.world.map[mapX + (mapY - stepY) * this.world.width] / 10) + this.world.table.MAP_DOOR_FRAME;
                            else if (side === 0 && this.world.map[(mapX - stepX) + mapY * this.world.width] === this.world.table.MAP_DOOR) rayTex = Math.floor(this.world.map[(mapX - stepX) + mapY * this.world.width] / 10) + this.world.table.MAP_DOOR_FRAME;
                            else rayTex = Math.floor(rayTex / 10) * 10 + this.world.table.MAP_WALL;
                            hit = 1;
                            break;
                        default:
                            if (side === 1 && this.world.map[mapX + (mapY - stepY) * this.world.width] === this.world.table.MAP_DOOR) rayTex = Math.floor(this.world.map[mapX + (mapY - stepY) * this.world.width] / 10) + this.world.table.MAP_DOOR_FRAME;
                            else if (side === 0 && this.world.map[(mapX - stepX) + mapY * this.world.width] === this.world.table.MAP_DOOR) rayTex = Math.floor(this.world.map[(mapX - stepX) + mapY * this.world.width] / 10) + this.world.table.MAP_DOOR_FRAME;
                            hit = 1;
                            break;
                    }
                }
            } // end of while loop
            if (hit === 0) {
                //ray go out hitting nothing?

            } else {
                if (side === 0) {
                    perpWallDist = (mapX - this.pos.x + wallOffset.x + (1 - stepX) / 2) / rayDir.x;
                } else if (side === 1) {
                    perpWallDist = (mapY - this.pos.y + wallOffset.y + (1 - stepY) / 2) / rayDir.y;
                }

                let lineHeight = Math.round(canvas.height / perpWallDist);

                let baseline = (0.5 + verticalAdjustment) * canvas.height;
                let drawStart = baseline - lineHeight / 2;
                let drawEnd = drawStart + lineHeight;

                if (side === 0) {
                    wallX = this.pos.y + perpWallDist * rayDir.y;
                } else if (side === 1 || side === 2) {
                    wallX = this.pos.x + perpWallDist * rayDir.x;
                }
                wallX -= Math.floor(wallX);

                if (rayTex % 10 === this.world.table.MAP_DOOR) wallX += this.world.doorOffsets[mapX + mapY * this.world.width];

                let wallTex = this.world.textureMap.get(rayTex);
                if (typeof wallTex === "string") {
                    p.stroke(wallTex);
                    p.line(x, drawStart, x, drawStart + lineHeight);
                } else {
                    let texX = Math.floor(wallX * wallTex.width);
                    if (side === 0 && rayDir.x > 0) {
                        texX = wallTex.width - texX - 1;
                    } else if (side === 1 && rayDir.y < 0) {
                        texX = wallTex.width - texX - 1;
                    }

                    p.image(wallTex, x, drawStart, 1, lineHeight, texX, 0, 1, wallTex.height);
                }

                if (side === 1 && rayTex % 10 !== this.world.MAP_DOOR) {
                    let ttt = this.world.textureMap.get(Math.floor(rayTex / 10) * 10 + this.world.table.MAP_WALL_SHADOW);
                    if (ttt) {
                        if (typeof ttt === "string") {
                            p.stroke(ttt);
                            p.line(x, drawStart, x, drawEnd);
                        } else {
                            let texX = Math.floor(wallX * ttt.width);
                            if (rayDir.y < 0) texX = ttt.width - texX - 1;
                            p.image(ttt, x, drawStart, 1, lineHeight, texX, 0, 1, ttt.height);
                        }
                    } else {
                        p.stroke("rgba(0,0,0,0.5)");
                        p.line(x, drawStart, x, drawEnd);
                    }
                } else if (side === 2) {
                    let ttt = this.world.textureMap.get(Math.floor(rayTex / 10) * 10 + this.world.table.MAP_WALL_SHADOW);
                    if (!ttt) {
                        if (angleSide === 0) {
                            var shadeOpacity = 0.6 * wallX;
                        } else {
                            var shadeOpacity = 0.6 * (1 - wallX);
                        }
                        p.stroke(`rgba(0,0,0,${shadeOpacity})`);
                        p.line(x, drawStart, x, drawEnd);
                    } else {
                        p.push();
                        if (angleSide === 0) {
                            var shadeOpacity = 0.6 * wallX;
                        } else {
                            var shadeOpacity = 0.6 * (1 - wallX);
                        }
                        p.drawingContext.globalAlpha = shadeOpacity;
                        if (typeof ttt === "string") {
                            p.stroke(ttt);
                            p.line(x, drawStart, x, drawEnd);
                        } else {
                            let texX = Math.floor(wallX * ttt.width);
                            p.image(ttt, x, drawStart, 1, lineHeight, texX, 0, 1, ttt.height);
                        }
                        p.pop();
                    }
                }

                this.zBuffer[x] = perpWallDist;
            }

        }// end of walls


        let tp = -1;
        if (tpWalls.length > 0) {
            tp = tpWalls.length - 1;
        }
        // draw sprite
        if (!noSprites) {
            if (p.frameCount === 1 || p.frameCount % this.spritesUpdateGap === 0) {
                this.updateSpritesBuffers();
            }


            for (let i = 0; i < this.world.sprites.length; i++) {
                const sp = this.world.sprites[this.spritesOrderBuffer[i]];
                let spriteX = sp.pos.x - this.pos.x;
                let spriteY = sp.pos.y - this.pos.y;

                let invDet = 1 / (this.plane.x * this.dir.y - this.dir.x * this.plane.y);
                let transformX = invDet * (this.dir.y * spriteX - this.dir.x * spriteY);
                let transformY = invDet * (this.plane.x * spriteY - this.plane.y * spriteX);
                if (transformY > 0) {
                    for (tp; tp >= 0; tp--) {
                        let tpDist = (this.pos.x - tpWalls[tp].mapX) * (this.pos.x - tpWalls[tp].mapX) + (this.pos.y - tpWalls[tp].mapY) * (this.pos.y - tpWalls[tp].mapY);
                        if (this.spritesDistanceBuffer[i] < tpDist) {
                            tpWalls[tp].display(canvas, verticalAdjustment);
                        } else {
                            break;
                        }
                    }

                    let spriteHeight = Math.abs(Math.floor(canvas.height / transformY)) * sp.scaleP.y;
                    let baseline = (0.5 + verticalAdjustment - sp.yAdjustment) * canvas.height;
                    let spDrawStartY = baseline - spriteHeight / 2;
                    let spriteScreenX = Math.floor(canvas.width / 2) * (1 + transformX / transformY);
                    let spriteWidth = Math.abs(Math.floor(canvas.height / transformY)) * sp.scaleP.x;
                    let spDrawStartX = Math.floor(spriteScreenX - spriteWidth / 2);
                    let spDrawEndX = spDrawStartX + spriteWidth;
                    let clipStartX = spDrawStartX;
                    let clipEndX = spDrawEndX;
                    if (spDrawStartX < -spriteWidth) {
                        spDrawStartX = -spriteWidth;
                    }
                    if (spDrawEndX > canvas.width + spriteWidth) {
                        spDrawEndX = canvas.width + spriteWidth;
                    }

                    for (let stripe = spDrawStartX; stripe < spDrawEndX; stripe++) {
                        if (transformY > this.zBuffer[stripe]) {
                            if (stripe - clipStartX <= 1) {
                                clipStartX = stripe;
                            } else {
                                clipEndX = stripe;
                                break;
                            }
                        }
                    }
                    if (clipStartX !== clipEndX && clipStartX < canvas.width && clipEndX > 0) {
                        let scaleDelta = sp.width / spriteWidth;
                        let drawXStart = Math.floor((clipStartX - spDrawStartX) * scaleDelta);
                        if (drawXStart < 0) drawXStart = 0;
                        let drawXEnd = Math.floor((clipEndX - clipStartX) * scaleDelta) + 1;
                        if (drawXEnd > sp.width) drawXEnd = sp.width;
                        let drawWidth = clipEndX - clipStartX;
                        if (drawWidth < 0) drawWidth = 0;
                        let drawAng = Math.atan2(spriteY, spriteX);
                        sp.updateRotationFrame(drawAng);
                        p.push();
                        p.drawingContext.imageSmoothingEnabled = false;
                        p.image(sp.buffer, clipStartX, spDrawStartY, drawWidth, spriteHeight, drawXStart, 0, drawXEnd, sp.height)
                        p.pop();
                    }
                }
            }// end looping sprites
        }
        // finally transparent walls
        for (tp; tp >= 0; tp--) {
            tpWalls[tp].display(canvas, verticalAdjustment);
        }
        tpWalls.length = 0;
        p.pop();
    }

    /**
     * render sky box and ray casting content
     * @param {p5.Renderer} canvas the main canvas or a p5.Graphics object
     */
    renderFrame(canvas = this.canvas) {
        if (this.world.ceiling || this.world.floor){
            if (this.world.ceiling && this.world.floor) {
                this.renderFloorAndCeiling(canvas);
            } else if (this.world.ceiling){
                this.renderFloorAndCeiling(false, true, canvas);
                this.renderSkyBox(false, true, canvas);
            } else {
                this.renderFloorAndCeiling(true, false, canvas);
                this.renderSkyBox(true, false, canvas);
                
            }
        } else {
            this.renderSkyBox(canvas);
        }
        this.renderRayCasting(false, canvas);
    }

}

export default Camera;
