class KeyboardControl {
    static defaultKeyMap = {
        forward: {
            keys: ["w"],
        },
        backward: {
            keys: ["s"],
        },
        goLeft: {
            keys: ["a"],
        },
        goRight: {
            keys: ["d"],
        },
        turnLeft: {
            keys: ["q"],
        },
        turnRight: {
            keys: ["e"],
        },
        tiltUp: {
            keys: ["z"],
        },
        tiltDown: {
            keys: ["x"],
        },
        moveDoor: {
            keys: [" "],
        }
    }

    /**
     * 
     * @param {object} [keyMap = KeyboardControl.defaultKeyMap]
     */
    constructor(keyMap = KeyboardControl.defaultKeyMap){
        this.keyMap = keyMap;
        for (const key in this.keyMap) {
            if (Object.hasOwnProperty.call(this.keyMap, key)) {
                if (!keyMap[key].initValue) {
                    this[key] = false;
                } else {
                    this[key] = keyMap[key].initValue;
                }
            }
        }
        this.regControl();
    }

    regControl(){
        document.addEventListener("keydown", this.keyDown.bind(this));
        document.addEventListener("keyup", this.keyUp.bind(this));
    }

    removeControl(){
        document.removeEventListener("keydown", this.keyDown.bind(this));
        document.removeEventListener("keyup", this.keyUp.bind(this));
    }

    /**
     * 
     * @param {KeyboardEvent} ev 
     */
    keyDown(ev) {
        ev.preventDefault();
        for (const key in this.keyMap) {
            if (Object.hasOwnProperty.call(this.keyMap, key)) {
                const keyList = this.keyMap[key].keys;
                if (keyList.includes(ev.key)) {
                    const toggle = this.keyMap[key].toggle;
                    const initV = this.keyMap[key].initValue;
                    if (toggle && toggle === "down") {
                        this[key] = !this[key];
                    } else if (!toggle) {
                        this[key] = initV !== undefined ? !initV : true;
                    }
                }
            }
        }
    }

    /**
     * 
     * @param {KeyboardEvent} ev 
     */
    keyUp(ev) {
        for (const key in this.keyMap) {
            if (Object.hasOwnProperty.call(this.keyMap, key)) {
                const keyList = this.keyMap[key].keys;
                if (keyList.includes(ev.key)) {
                    const toggle = this.keyMap[key].toggle;
                    const initV = this.keyMap[key].initValue;
                    if (toggle && toggle === "up") {
                        this[key] = !this[key];
                    } else if (!toggle) {
                        this[key] = initV !== undefined ? initV : false;
                    }
                }
            }
        }
    }

     /**
     * this function will not copy the object
     * 
     * @param {object} keyMap 
     */
     loadKeyMap(keyMap) {
        this.keyMap = keyMap;
    }

    /**
     * add a new keyboard control item
     * @param {string} name 
     * @param {Array} keyList 
     * @param {undefined} [toggle=undefined] when the value should be toggled, "down" or "up", undefined means it is not a toggle value
     * @param {undefined} [initValue=undefined] the default value when no keyboard input
     */
    addItem(name, keyList, toggle = undefined, initValue = undefined) {
        this.keyMap[name] = {
            keys: keyList,
            toggle: toggle,
            initValue: initValue
        }
        this[name] = false;
    }

    /**
     * delete a keyboard control item
     * @param {string} name 
     */
    removeItem(name) {
        if (this.keyMap.hasOwnProperty(name)) {
            delete this.keyMap[name];
            delete this.name;
        }
    }
}

export default KeyboardControl;