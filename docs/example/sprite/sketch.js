
let canvas;
let world, camera, controller, textureMap;
let mapData = [
    [1,1,1,1,1,1,1,1,1],
    [1,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,1],
    [1,1,1,1,1,1,1,1,1],
]

let sprites = [];

// advance animation control over the sprite
// there's a lots of way to do that here is just one example
let guardMoveTrail = [[{x:7.5, y: 7.5}, 120], [{x:1.5, y:1.5}, 120]];
let guardMoveSpeed = 0.5;
let guardMoving = false;
let guardMovingCurrent = 0;
let guardMovingTarget = 1;
let guardCounter = 0;

function preload() {
    star = loadImage("./assets/star.png");
    guard = loadImage("./assets/guard.png");
}

function setup() {
    canvas = createCanvas(600, 600);
    frameRate(30);
    // star sprite
    sprites.push(RayCaster.createSprite(star, { x: 7.5, y: 7.5 }, 100, 100));
    sprites[0].setYAdjustment(0.1);
    sprites[0].setAnimationGap(15);
    sprites[0].scale(0.5);
    // guard sprite
    sprites.push(RayCaster.createSprite(guard, { x: 1.5, y: 1.5 }, 128, 128, - Math.PI));
    sprites[1].setYAdjustment(0);
    sprites[1].setAnimationGap(6);
    sprites[1].setAnimationGroups([[0],[1,2,3]]); // idle & moving
    sprites[1].setCurrentAnimationGroup(0);
    background(0);
    world = RayCaster.createWorld(9, 9);
    world.loadMap(mapData);
    textureMap = RayCaster.createTextureMap(1, "red");
    world.loadTextureMap(textureMap);
    sprites.forEach(sprite => world.addSprite(sprite));
    camera = RayCaster.createCamera({ x: 1.5, y: 7.5 }, { x: 1, y: -1 }, 0.5, world, canvas);
    keyboardController = RayCaster.initKeyboardControl();
    pointerLockController = RayCaster.initPointerLockControl(camera, canvas.canvas);
    keyboardController.addItem("showMiniMap", ["m"], "up", false);
    camera.renderFrame();
}

function draw() {
    camera.renderFrame();
    toggleMiniMap();
    cameraMove()
    doorInteraction();
    worldUpdate();
}

function toggleMiniMap() {
    if (keyboardController.showMiniMap) {
        camera.renderMiniMap({ x: 7, y: 7 }, 0, 0, 200, 200);
    }
}

function cameraMove() {
    const MOVE_SPEED = 0.04, TURN_SPEED = 0.02;
    let movement = { x: 0, y: 0 };
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

    if (keyboardController.turnLeft) {
        camera.rotate(TURN_SPEED);
    }
    if (keyboardController.turnRight) {
        camera.rotate(-TURN_SPEED);
    }
    if (keyboardController.tiltUp) {
        camera.tilt(TURN_SPEED);
    }
    if (keyboardController.tiltDown) {
        camera.tilt(-TURN_SPEED);
    }
}

function doorInteraction() {
    if (keyboardController.moveDoor) {
        camera.moveDoor();
    }
}

function worldUpdate() {
    world.update();
    sprites.forEach(s => s.update(frameCount));
    guardMove();
}

function guardMove(){
    if(!guardMoving) {
        guardCounter ++;
        if(guardCounter > guardMoveTrail[guardMovingCurrent][1]) {
            guardCounter = 0;
            guardMoving = true;
            sprites[1].setCurrentAnimationGroup(1);
        }
    } else {
        let dirX = guardMoveTrail[guardMovingTarget][0].x - sprites[1].pos.x;
        let dirY = guardMoveTrail[guardMovingTarget][0].y - sprites[1].pos.y;
        sprites[1].rotateTo(Math.PI + Math.atan2(dirY, dirX));
        let m = dirX * dirX + dirY * dirY;
        if (m < 0.01) {
            guardMoving = false;
            guardMovingCurrent = guardMovingTarget;
            guardMovingTarget = (guardMovingTarget + 1) % guardMoveTrail.length;
            sprites[1].setCurrentAnimationGroup(0)
        } else {
            m = Math.sqrt(m);
            dirX /= m;
            dirY /= m;
            sprites[1].pos.x += dirX * (guardMoveSpeed / 30);
            sprites[1].pos.y += dirY * (guardMoveSpeed / 30);
        }
    }
}

function mouseClicked() {
    if (!pointerLockController.pointerLocked) pointerLockController.lock();
}
