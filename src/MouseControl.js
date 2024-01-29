/**
 * class for some basic input control
 * you are advise to write you own controller (based on this class or not)
 */
class MouseControl {
    /**
     * 
     * @param {HTMLElement} [ele = null] the element to bind the events to
     */
    constructor(ele = null) {
        // mouse 
        this.mouseIsDown = false;
        this.mouseX = 0;
        this.mouseY = 0;
        this.pmouseX = 0;
        this.pmouseY = 0;
        this.mouseButton = -1;
        this.mouseCX = 0;
        this.mouseCY = 0;
        this.pmouseCX = 0
        this.pmouseCY = 0;
        this.regControl(ele);
    }

    /**
     * register the control to the page
     * @param {HTMLElement} ele 
     */
    regControl(ele) {
        let mt = ele || document;
        this.targetElement = mt;
        mt.ownerDocument.addEventListener("mousedown", this.mouseDown.bind(this));
        mt.ownerDocument.addEventListener("mouseup", this.mouseUp.bind(this));
        mt.ownerDocument.addEventListener("mousemove", this.mouseMove.bind(this));
    }

    removeControl() {
        this.targetElement.ownerDocument.removeEventListener("mousedown", this.mouseDown.bind(this));
        this.targetElement.ownerDocument.removeEventListener("mouseup", this.mouseUp.bind(this));
        this.targetElement.ownerDocument.removeEventListener("mousemove", this.mouseMove.bind(this));
    }

    /**
     * 
     * @param {MouseEvent} ev 
     */
    mouseDown(ev) {
        ev.preventDefault();
        this.mouseIsDown = true;
        this.mouseButton = ev.button;
    }

    /**
     * 
     * @param {MouseEvent} ev 
     */
    mouseMove(ev) {
        this.pmouseX = this.mouseX;
        this.pmouseY = this.mouseY;
        this.pmouseCX = this.mouseCX;
        this.pmouseCY = this.mouseCY;
        this.mouseX = ev.offsetX;
        this.mouseY = ev.offsetY;
        this.mouseCX = ev.clientX;
        this.mouseCY = ev.clientY;
    }


    /**
     * 
     * @param {MouseEvent} ev 
     */
    mouseUp(ev) {
        this.mouseIsDown = false;
        this.mouseButton = -1;
    }
}


export default MouseControl;
