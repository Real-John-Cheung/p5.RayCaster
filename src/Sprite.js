class Sprite {
    /**
     * init a sprite
     * @param {p5.Image} source source image for the sprite, single image is load and use for animation and rotation (if any), see readme for more info
     * @param {Vector} pos {x, y} or a p5.Vector object
     * @param {number} width 
     * @param {number} height 
     * @param {number} [angle = 0]
     * @param {number} [yAdjustment=0] [-0.5, 0.5] -0.5 ~ 0.5, negative number will make the sprite appear lower and positive number will make it appear higher
     * @param {number} [animationGap=0] number of frame for before change to the next animation
     * @param {p5} [p5Inst = null] reference to the p5 instance if in instance mode, if not specified try to call functions blind to windows
     */
    constructor(source, pos, width, height, angle = 0, yAdjustment = 0, animationGap = 0, p5Inst = null) {
        this.pos = { x: pos.x, y: pos.y };
        this.ang = angle;
        this.src = source;
        this.width = width;
        this.height = height;
        this.pInst = p5Inst;
        this.yAdjustment = yAdjustment;
        this.animationGap = animationGap;
        //
        this.buffer = null;
        if (this.pInst !== null) {
            this.buffer = this.pInst.createGraphics(this.width, this.height);
        } else {
            if (window.createGraphics) {
                this.buffer = window.createGraphics(this.width, this.height);
            } else {
                throw new Error("p5 is not found!")
            }
        }
        //
        this.animationFrames = Math.floor(this.src.height / this.height);
        this.animationGroups = [];
        let t = [];
        for (let i = 0; i < this.animationFrames; i++) {
            t.push(i);
        }
        this.animationGroups.push(t);

        this.rotationFrames = Math.floor(this.src.width / this.width);
        this.currentRotation = 0;
        this.currentAnimation = 0;
        this.currentAnimationGroup = 0;
        this.currentAnimationIdx = 0;
        if (this.rotationFrames > 1) {
            this.rotationDivision = (Math.PI * 2) / this.rotationFrames;
            this.updateRotationFrame(Math.PI);
        }
        this.drawBuffer();
    }

    /**
     * 
     * @param {number} gap number of frame (main canvas) for before change to the other animation
     */
    setAnimationGap(gap) {
        this.animationGap = gap;
    }

    /**
     * advance animation control
     * @param {Array} grouping arrays of animation frames in group, e.g. [[0,1,2,3],[4,5,6]]
     */
    setAnimationGroups(grouping) {
        this.animationGroups = grouping;
    }

    /**
     * 
     * @param {number} group 
     */
    setCurrentAnimationGroup(group) {
        if (this.animationGroups && group > -1 && group < this.animationGroups.length) {
            this.currentAnimationGroup = group;
            this.currentAnimationIdx = 0;
            this.currentAnimation = this.animationGroups[this.currentAnimationGroup][this.currentAnimationIdx];
        }
    }

    /**
     * 
     * @param {number} ratio -0.5 ~ 0.5, negative number will make the sprite appear lower and positive number will make it appear higher
     */
    setYAdjustment(ratio) {
        this.yAdjustment = ratio;
    }

    /**
     * update the animation, should have animation rate set
     * 
     * @param {number} frameCount current frame count from main canvas
     */
    update(frameCount) {
        if (this.animationGap <= 0 || this.animationFrames === 1) return;
        if (frameCount % this.animationGap === 0) this.nextAnimationFrame();
    }

    nextAnimationFrame() {
        this.currentAnimationIdx++;
        this.currentAnimationIdx = this.currentAnimationIdx % this.animationGroups[this.currentAnimationGroup].length;
        this.currentAnimation = this.animationGroups[this.currentAnimationGroup][this.currentAnimationIdx];
        this.drawBuffer();
    }

    /**
     * update the new frame for the animation
     * @param {number} newFrame 
     */
    updateAnimationFrame(newFrame) {
        if (this.currentAnimation !== newFrame) {
            this.currentAnimation = newFrame;
            let g, i;
            this.animationGroups.forEach((group, id) => {
                let ii = group.indexOf(this.currentAnimation);
                if (ii > -1) {
                    g = id;
                    i = ii;
                }
            });
            this.currentAnimationGroup = g;
            this.currentAnimationIdx = i;
            this.drawBuffer();
        }
    }

    /**
     * 
     * @param {number} angle 
     */
    updateRotationFrame(angle) {
        let deltaAng, newRotation;
        if (this.rotationFrames === 1) {
            newRotation = 0;
        } else {
            deltaAng = angle - this.ang + this.rotationDivision / 2;
            while (deltaAng < 0) {
                deltaAng += Math.PI * 2;
            }
            while (deltaAng > Math.PI * 2) {
                deltaAng -= Math.PI * 2;
            }
            newRotation = Math.floor((deltaAng) / this.rotationDivision);
        }
        if (this.currentRotation !== newRotation) {
            this.currentRotation = newRotation;
            this.drawBuffer();
        }
    }

    /**
     * 
     * @param {Vector} movement {x, y} or a p5.Vector
     */
    move(movement) {
        if (!this.world) return;
        let idx1 = Math.floor(this.pos.x + movement.x) + Math.floor(this.pos.y) * this.world.width;
        let idx2 = Math.floor(this.pos.x) + Math.floor(this.pos.y + movement.y) * this.world.width;
        if (this.world.map[idx1] === this.world.table.MAP_FLOOR || this.world.doorStates[idx1] === this.world.table.DOOR_OPEN) {
            if (Math.floor(this.pos.x + movement.x) > -1 && Math.floor(this.pos.x + movement.x) < this.world.width) this.pos.x += movement.x; // can't go out sdie the world

        }
        if (this.world.map[idx2] === this.world.table.MAP_FLOOR || this.world.doorStates[idx2] === this.world.table.DOOR_OPEN) {
            if (Math.floor(this.pos.y + movement.y) > -1 && Math.floor(this.pos.y + movement.y) < this.world.height) this.pos.x += movement.y;
        }
    }

    /**
     * 
     * @param {number} angle 
     */
    rotate(angle) {
        this.ang += angle;
    }
    
    /**
     * 
     * @param {number} angle 
     */
    rotateTo(angle){
        this.ang = angle
    }

    /**
     * update image buffer of the sprite
     */
    drawBuffer() {
        this.buffer.clear();
        this.buffer.image(this.src, 0, 0, this.width, this.height, this.currentRotation * this.width, this.currentAnimation * this.height, this.width, this.height);
    }

    /**
     * destroy the sprite to free resources
     */
    destroy() {
        this.drawBuffer.remove();
        delete this;
    }
}
export default Sprite;