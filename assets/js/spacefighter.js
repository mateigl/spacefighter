let ship_speed = 10;

// let canvas_width = 1024;
// let canvas_height = 512;

let canvas_width = window.innerWidth;
let canvas_height = window.innerHeight;


//Aliases
let Application = PIXI.Application,
    loader = PIXI.Loader.shared,
    resources = PIXI.Loader.shared.resources,
    Sprite = PIXI.Sprite,
    Graphics = PIXI.Graphics;

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
app.renderer.view.style.position = "absolute";
app.renderer.view.style.display = "block";
app.renderer.autoResize = true;
app.renderer.resize(window.innerWidth, window.innerHeight);

let ship, state;
let meteorites = [];
let bullets = [];
let debris = [];
let counter = 0;
let speed_factor = 20;
let lives_left = 3;
let life;
let speed_display;

let style = new PIXI.TextStyle({fill: "white"});

loader.add("ship", "assets/img/ship2.png").load(setup);

function setup() {


    ship = new Sprite(resources.ship.texture);
    ship.width = 64;
    ship.height = 64;
    ship.x = (canvas_width / 2 - ship.width / 2);
    ship.y = (canvas_height - ship.height);

    ship.vx = 0;
    ship.vy = 0;
    app.stage.addChild(ship);


    // controls
    // let left = keyboard("ArrowLeft"),
    //     up = keyboard("ArrowUp"),
    //     right = keyboard("ArrowRight"),
    //     down = keyboard("ArrowDown"),
    //     space = keyboard(" ");

    let left = keyboard("a"),
        up = keyboard("w"),
        right = keyboard("d"),
        down = keyboard("s"),
        space = keyboard(" ");

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

    space.press = () => {
        shoot(ship)
    };


    state = play;
    app.ticker.add(delta => gameLoop(delta));
}

function gameLoop(delta) {
    state(delta);
}

function play(delta) {
    if (lives_left <= 0) {
        app.ticker.stop();
        let game_over_screen = new PIXI.Text("GAME OVER", new PIXI.TextStyle({fill: "yellow", fontSize: 64}));
        game_over_screen.x = (canvas_width / 2 - game_over_screen.width / 2);
        game_over_screen.y = (canvas_height / 2 - game_over_screen.height / 2);
        app.stage.addChild(game_over_screen)
    }

    app.stage.removeChild(life);
    life = new PIXI.Text(lives_left, style);
    life.x = (canvas_width - life.width);
    app.stage.addChild(life);

    app.stage.removeChild(speed_display);
    speed_display = new PIXI.Text(speed_factor, style);
    speed_display.x = (canvas_width - life.width - speed_display.width * 2);
    app.stage.addChild(speed_display);

    // custom ticker
    (counter === 500) ? counter = 0 : counter++;

    if (!(((ship.x + ship.vx + ship.width) > canvas_width) || ((ship.x + ship.vx) < 0))) {
        ship.x += ship.vx;
    }

    if (!(((ship.y + ship.vy + ship.height) > canvas_height) || ((ship.y + ship.vy) < 0))) {
        ship.y += ship.vy;
    }

    // if (counter % (500 - speed_factor) === 0) {
    //     spawnMeteorite(speed_factor);
    // }

    if (counter % 20 === 0) {
        spawnMeteorite(speed_factor);
    }

    if (counter % 10 === 0) {
        spawnDebris(speed_factor)
    }

    if (counter % 100 === 0 && speed_factor < 500) {
        speed_factor += 0.5
    }

    meteorites.forEach(function (m) {
        m.y += m.vy;
        if (m.y > canvas_height) {
            app.stage.removeChild(m);
            delete meteorites[meteorites.indexOf(m)]
        }
        if (hitTestRectangle(ship, m)) {
            lives_left -= 1;
            app.stage.removeChild(m);
            delete meteorites[meteorites.indexOf(m)]

        }

        bullets.forEach(function (b) {
            if (hitTestRectangle(m, b)) {
                app.stage.removeChild(m);
                delete meteorites[meteorites.indexOf(m)];

                app.stage.removeChild(b);
                delete bullets[bullets.indexOf(b)]
            }

            if (b.y < 0) {
                app.stage.removeChild(b);
                delete bullets[bullets.indexOf(b)]
            }

        });
    });


    debris.forEach(function (d) {
        d.y += d.vy;
        if (d.y > canvas_height) {
            app.stage.removeChild(d);
            delete debris[debris.indexOf(d)]
        }
    });


    bullets.forEach(function (b) {
        b.y += b.vy;
        b.x += b.vx
    })


}

function shoot(ship) {
    spawnBullet(ship, ship.x, ship.y);
    spawnBullet(ship, (ship.width + ship.x), ship.y)
}

function spawnBullet(ship, x, y) {
    let bullet = new Graphics();
    bullet.beginFill(0xf44242);
    // bullet.drawCircle(0, 0, 32);
    bullet.drawRect(0, 0, 4, 8);
    bullet.endFill();

    // bullet.x = (ship.x + (ship.width / 2));
    bullet.x = x;
    // bullet.y = ship.y;
    bullet.y = y;

    bullet.vy = -20;
    bullet.vx = (ship.vx * 0.5);

    app.stage.addChild(bullet);
    bullets.push(bullet);
}

function spawnMeteorite(speed_factor) {
    let meteorite = new Graphics();
    meteorite.beginFill(0xa66441);
    // meteorite.drawCircle(0, 0, 32);
    meteorite.drawRect(0, 0, 16, 32);
    meteorite.endFill();

    meteorite.x = (Math.random() * canvas_width);
    meteorite.y = 0;

    meteorite.vy = speed_factor / 4;

    app.stage.addChild(meteorite);
    meteorites.push(meteorite);
}

function spawnDebris(speed_factor) {
    let star = new Graphics();
    star.beginFill(0xFFFFFF);
    star.drawRect(0, 0, 1, 2);
    debris.fillOpacity = Math.random();
    star.endFill();

    star.x = (Math.random() * canvas_width);
    star.y = 0;
    star.vy = (speed_factor / 4 * Math.random());

    app.stage.addChild(star);
    debris.push(star)
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

function hitTestRectangle(r1, r2) {

    //Define the variables we'll need to calculate
    let hit, combinedHalfWidths, combinedHalfHeights, vx, vy;

    //hit will determine whether there's a collision
    hit = false;

    //Find the center points of each sprite
    r1.centerX = r1.x + r1.width / 2;
    r1.centerY = r1.y + r1.height / 2;
    r2.centerX = r2.x + r2.width / 2;
    r2.centerY = r2.y + r2.height / 2;

    //Find the half-widths and half-heights of each sprite
    r1.halfWidth = r1.width / 2;
    r1.halfHeight = r1.height / 2;
    r2.halfWidth = r2.width / 2;
    r2.halfHeight = r2.height / 2;

    //Calculate the distance vector between the sprites
    vx = r1.centerX - r2.centerX;
    vy = r1.centerY - r2.centerY;

    //Figure out the combined half-widths and half-heights
    combinedHalfWidths = r1.halfWidth + r2.halfWidth;
    combinedHalfHeights = r1.halfHeight + r2.halfHeight;

    //Check for a collision on the x axis
    if (Math.abs(vx) < combinedHalfWidths) {

        //A collision might be occurring. Check for a collision on the y axis
        if (Math.abs(vy) < combinedHalfHeights) {

            //There's definitely a collision happening
            hit = true;
        } else {

            //There's no collision on the y axis
            hit = false;
        }
    } else {

        //There's no collision on the x axis
        hit = false;
    }

    //`hit` will be either `true` or `false`
    return hit;
}