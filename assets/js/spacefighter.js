let ship_speed = 15;

let canvas_width = 1024;
let canvas_height = 512;

//Aliases
let Application = PIXI.Application,
    loader = PIXI.Loader.shared,
    resources = PIXI.Loader.shared.resources,
    Sprite = PIXI.Sprite;

//Create a Pixi Application
let app = new Application({
        width: canvas_width,
        height: canvas_height,
        antialias: true,
        transparent: false,
        resolution: 1
    }
);


let canvas_container = document.getElementById("map");
canvas_container.appendChild(app.view);


app.renderer.backgroundColor = 0x151a3d;

let ship, state;

loader.add("ship", "assets/img/ship2.png").load(setup);

function setup() {


    ship = new Sprite(resources.ship.texture);
    ship.vx = 0;
    ship.vy = 0;
    ship.width = 64;
    ship.height = 64;
    app.stage.addChild(ship);


    // controls

    let left = keyboard("ArrowLeft"),
        up = keyboard("ArrowUp"),
        right = keyboard("ArrowRight"),
        down = keyboard("ArrowDown");

    left.press = () => {
        ship.vx = -ship_speed;
    };
    left.release = () => {
        right.isDown ? ship.vx = ship_speed : ship.vx = 0
    };

    right.press = () => {
        ship.vx = ship_speed;
    };
    right.release = () => {
        left.isDown ? ship.vx = -ship_speed : ship.vx = 0
    };

    up.press = () => {
        ship.vy = -ship_speed;
    };
    up.release = () => {
        down.isDown ? ship.vy = ship_speed : ship.vy = 0
    };

    down.press = () => {
        ship.vy = ship_speed;
    };
    down.release = () => {
        up.isDown ? ship.vy = -ship_speed : ship.vy = 0
    };


    state = play;
    app.ticker.add(delta => gameLoop(delta));
}

function gameLoop(delta) {
    state(delta);
}

function play(delta) {

    ship.x += ship.vx;
    ship.y += ship.vy;

}

function keyboard(value) {
    let key = {};
    key.value = value;
    key.isDown = false;
    key.isUp = true;
    key.press = undefined;
    key.release = undefined;

    key.downHandler = event => {
        if (event.key === key.value) {
            if (key.isUp && key.press) key.press();
            key.isDown = true;
            key.isUp = false;
            event.preventDefault();
        }
    };

    key.upHandler = event => {
        if (event.key === key.value) {
            if (key.isDown && key.release) key.release();
            key.isDown = false;
            key.isUp = true;
            event.preventDefault();
        }
    };

    const downListener = key.downHandler.bind(key);
    const upListener = key.upHandler.bind(key);

    window.addEventListener("keydown", downListener, false);
    window.addEventListener("keyup", upListener, false);

    key.unsubscribe = () => {
        window.removeEventListener("keydown", downListener);
        window.removeEventListener("keyup", upListener);
    };

    return key;
}