import Camera from "./Camera";

/**
 * transparent wall is drawn like Sprite
 */
class TransparentWall {
    /**
     * 
     * @param {Camera} camera 
     * @param {number} x x coordinate in map
     * @param {number} y y coordinate in map
     * @param {number} side 
     * @param {number} screenX screen strip containing this wall
     * @param {number} texC entry to look up for texture
     */
    constructor(camera, x, y, side, screenX, texC) {
        this.mapX = x;
        this.mapY = y;
        this.camera = camera;
        this.side = side;
        this.screenX = [screenX]
        this.tex = texC
    }

    /**
     * 
     * @param {number} x 
     * @param {number} side 
     * @param {Array} cameraXCoords the loop up table for cameraX
     */
    getRayDir(x, side, cameraXCoords) {
        if (!cameraXCoords) cameraXCoords = this.camera.cameraXCoords;
        if (side === 1) {
            return this.camera.dir.y + this.camera.plane.y * cameraXCoords[x];
        } else {
            return this.camera.dir.x + this.camera.plane.x * cameraXCoords[x];
        }
    }

    /**
     * get perpendicular distance between camera and the wall
     * @param {number} x 
     */
    getPerpDist(x) {
        let step = 1;
        let rayDir = this.getRayDir(x, this.side);
        if (rayDir < 0) { step = -1 }
        if (this.side === 1) {
            return (this.mapY - this.camera.pos.y + (0.5 * step) + (1 - step) / 2) / rayDir;
        } else {
            return (this.mapX - this.camera.pos.x + (0.5 * step) + (1 - step) / 2) / rayDir;
        }
    }

    /**
     * 
     * @param {p5.Renderer} canvas 
     * @param {number} verticalAdjustment 
     */
    display(canvas, verticalAdjustment) {
        const p = canvas._isMainCanvas ? canvas._pInst : canvas;
        const texture = this.camera.world.textureMap.get(this.tex);
        p.push();
        p.drawingContext.globalAlpha = 0.5;
        for (let x = this.screenX[0]; x < this.screenX[0] + this.screenX.length; x++) {
            let prepDist = this.getPerpDist(x);
            let lineHeight = Math.round(canvas.height / prepDist);
            let baseline = (0.5 + verticalAdjustment) * canvas.height;
            let drawStart = baseline - lineHeight / 2;

            let wallX;
            if (this.side === 0) {
                wallX = this.camera.pos.y + prepDist * this.getRayDir(x, 1);
            } else if (this.side === 1) {
                wallX = this.camera.pos.x + prepDist * this.getRayDir(x, 0);
            }

            wallX -= Math.floor(wallX);
            if (typeof texture === "string") {
                p.stroke(texture);
                p.line(x, drawStart, x, drawStart + lineHeight);
            } else {
                let texX = Math.floor(wallX * texture.width);
                p.image(texture, x, drawStart, 1, lineHeight, texX, 0, 1, texture.height);
            }

        }
        p.pop()
    }
}

export default TransparentWall;