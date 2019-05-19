let canvas_width = (window.innerWidth - 20);
let canvas_height = (window.innerHeight - 20);

//Aliases
let Application = PIXI.Application,
    loader = PIXI.loader,
    resources = PIXI.loader.resources,
    Sprite = PIXI.Sprite;

//Create a Pixi Application
let app = new Application({
        width: canvas_width,
        height: canvas_height,
        antialias: true,
        transparent: true,
        resolution: 1
    }
);


let canvas_container = document.getElementById("map");
canvas_container.appendChild(app.view);

//app.renderer.backgroundColor = 0x0e0e28;
loader.add([{name: "ship", url: "assets/img/ship.png"}]).load(setup());


function setup() {

        let ship_sprite = new Sprite(loader.resources.ship.texture);
        //let ship = new Sprite.fromImage("assets/img/ship.png");
        app.stage.addChild(ship_sprite);

}