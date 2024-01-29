import Camera from "./Camera";
class PointerLockControl {
    /**
     * 
     * @param {Camera} camera the camera this controller control
     * @param {HTMLElement} ele  the element this controller bind to
     */
    constructor(camera, ele) {
        this.camera = camera;
        this.targetElement = ele;
        this.pointerSpeed = 0.002;
        this.pointerLocked = false;
        this.mouseIsDown = false;
        this.mouseButton = -1;
        this.invertedX = false;
        this.invertedY = false;
        this.switchXY = false;
        this.regControl();
    }

    regControl() {
        this.targetElement.ownerDocument.addEventListener("mousemove", this.mouseMove.bind(this));
        this.targetElement.ownerDocument.addEventListener("pointerlockchange", this.pointerLockChange.bind(this));
        this.targetElement.ownerDocument.addEventListener("pointerlockerror", this.pointerLockError.bind(this));
        this.targetElement.ownerDocument.addEventListener("mouseup", this.mouseUp.bind(this));
        this.targetElement.ownerDocument.addEventListener("mousedown", this.mouseDown.bind(this));
    }

    removeControl() {
        this.targetElement.ownerDocument.removeEventListener("mousemove", this.mouseMove.bind(this));
        this.targetElement.ownerDocument.removeEventListener("pointerlockchange", this.pointerLockChange.bind(this));
        this.targetElement.ownerDocument.removeEventListener("pointerlockerror", this.pointerLockError.bind(this));
        this.targetElement.ownerDocument.removeEventListener("mouseup", this.mouseUp.bind(this));
        this.targetElement.ownerDocument.removeEventListener("mousedown", this.mouseDown.bind(this));
    }

    lock() {
        this.targetElement.requestPointerLock();
    }

    unlock() {
        this.targetElement.ownerDocument.exitPointerLock();
    }

    /**
     * 
     * @param {number} speed 
     */
    setPointerSpeed(speed) {
        this.pointerSpeed = speed;
    }

    pointerLockChange() {
        if (this.targetElement.ownerDocument.pointerLockElement === this.targetElement) {
            this.pointerLocked = true;
        } else {
            this.pointerLocked = false;
        }
    }

    pointerLockError() {
        console.error("pointerLock unavailable");
    }

    /**
     * 
     * @param {MouseEvent} ev 
     * 
     */
    mouseMove(ev) {
        if (!this.pointerLocked) return;
        const camera = this.camera;
        const mx = ev.movementX * (this.invertedX ? 1 : -1);
        const my = ev.movementY * (this.invertedY ? 1 : -1);
        camera.rotate((this.switchXY ? my : mx) * this.pointerSpeed);
        camera.tilt((this.switchXY ? mx : my) * this.pointerSpeed);
    }

    mouseDown(ev) {
        this.mouseIsDown = true;
        this.mouseButton = ev.button;
    }

    mouseUp(ev) {
        this.mouseIsDown = false;
    }

}

export default PointerLockControl;