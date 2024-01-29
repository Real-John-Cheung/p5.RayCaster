let canvas;
let world, camera, controller, textureMap;
let mapData = [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 5, 1, 1, 1, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 6, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 7, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 1, 7, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 7, 1, 9, 1, 8, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 9, 0, 0, 0, 9, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 8, 1, 9, 1, 7, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1],
    [1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 0, 1],
    [1, 0, 0, 1, 1, 0, 0, 0, 0, 1, 1, 3, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 11, 0, 1, 0, 0, 0, 1, 0, 11, 0, 0, 0, 0, 0, 1, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 11, 11, 11, 11, 11, 11, 11, 11, 11, 1, 1, 1, 1, 1, 1, 1, 1]
]

let miniMapOptions = {
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
        [11, { fill: "purple" }],
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

function setup() {
    canvas = createCanvas(600, 600);
    frameRate(30);
    background(0)
    world = RayCaster.createWorld(24, 24);
    world.loadMap(mapData);
    textureMap = RayCaster.createTextureMap(1, "red", 11, "purple", 2, "rgba(0,0,0,0.4)", 12, "rgba(255,255,255,0.4)", 3, "white", 4, "blue", 5, "pink", 6, "cyan", 7, "red", 8, "red", 9 , "yellow");
    world.loadTextureMap(textureMap);
    camera = RayCaster.createCamera({x:20,y:20}, {x:-1, y:-1}, 0.5, world, canvas);
    keyboardController = RayCaster.initKeyboardControl();
    pointerLockController = RayCaster.initPointerLockControl(camera, canvas.canvas);
    keyboardController.addItem("showMiniMap", ["m"], "up", false);
    camera.setMiniMapRenderOptions(miniMapOptions);
    camera.renderFrame();
}

function draw() {
    camera.renderFrame();
    toggleMiniMap();
    cameraMove()
    doorInteraction();
    worldUpdate();
}

function toggleMiniMap(){
    if (keyboardController.showMiniMap) {
        camera.renderMiniMap({x:5, y:5}, 0, 0, 200, 200);
    }
}

function cameraMove(){
    const MOVE_SPEED = 0.04, TURN_SPEED = 0.02;
    let movement = {x: 0, y : 0};
    if (keyboardController.forward) {
        movement.x += camera.dir.x * MOVE_SPEED;
        movement.y += camera.dir.y * MOVE_SPEED;
    }
    if (keyboardController.backward) {
        movement.x -= camera.dir.x * MOVE_SPEED;
        movement.y -= camera.dir.y * MOVE_SPEED;
    }
    if (keyboardController.goLeft) {
        movement.x -= camera.plane.x * MOVE_SPEED;
        movement.y -= camera.plane.y * MOVE_SPEED;
    }

    if (keyboardController.goRight) {
        movement.x += camera.plane.x * MOVE_SPEED;
        movement.y += camera.plane.y * MOVE_SPEED;
    }
    camera.move(movement);
    
    if (keyboardController.turnLeft){
        camera.rotate(TURN_SPEED);
    }
    if (keyboardController.turnRight){
        camera.rotate(-TURN_SPEED);
    }
    if (keyboardController.tiltUp){
        camera.tilt(TURN_SPEED);
    }
    if (keyboardController.tiltDown){
        camera.tilt(-TURN_SPEED);
    }
}

function doorInteraction(){
    if (keyboardController.moveDoor) {
        camera.moveDoor();
    }
}

function worldUpdate(){
    world.update( );
}

function mouseClicked(){
    if (!pointerLockController.pointerLocked) pointerLockController.lock();
}
