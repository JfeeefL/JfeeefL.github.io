"use strict"
//cube
//top
let cube = new surfaceEntity([
    new item(
        new vector3(2,0,0),
        [
            new vector3(-1, -1, 1),
            new vector3(-1, 1, 1),
            new vector3(1, 1, 1),
            new vector3(1, -1, 1),
        ],
        "rgba(255,88,88,0.5)"
    )
,
//bottom
    new item(
        new vector3(2,0,0),
        [
            new vector3(-1, -1, -1),
            new vector3(-1, 1, -1),
            new vector3(1, 1, -1),
            new vector3(1, -1, -1),
        ],
        "rgba(71,220,153,0.5)"
    )
,
//front

    new item(
        new vector3(2,0,0),
        [
            new vector3(-1, -1, 1),
            new vector3(-1, 1, 1),
            new vector3(-1, 1, -1),
            new vector3(-1, -1, -1),
        ],
        "rgba(213,119,229,0.5)"
    )
,
//back

    new item(
        new vector3(2,0,0),
        [
            new vector3(1, -1, 1),
            new vector3(1, 1, 1),
            new vector3(1, 1, -1),
            new vector3(1, -1, -1),
        ],
        "rgba(255,128,63,0.5)"
    )
,
//left
    new item(
        new vector3(2,0,0),
        [
            new vector3(-1, -1, 1),
            new vector3(-1, -1, -1),
            new vector3(1, -1, -1),
            new vector3(1, -1, 1),
        ],
        "rgba(209,255,98,0.5)"
    )
,

//right

    new item(
        new vector3(2,0,0),
        [
            new vector3(-1, 1, 1),
            new vector3(-1, 1, -1),
            new vector3(1, 1, -1),
            new vector3(1, 1, 1),
        ],
        "rgba(94,197,231,0.5)"
    )
]);

let corner = new interactiveEntity(
    new vector3(2,0,0),
    [
        new vector3(-1,-1,-1),
        new vector3(-1,-1,1),
        new vector3(-1,1,-1),
        new vector3(-1,1,1),
        new vector3(1,-1,-1),
        new vector3(1,-1,1),
        new vector3(1,1,-1),
        new vector3(1,1,1)
    ],
    "rgba(0,0,0,0)",
    false,
    10,
    function(){
        this.style = "rgba(255,102,0,0.02)";
    },
    function(x, y) {
        cube.transform_vertex(rotation(x*0.001,camera.get_vertical()));
        cube.transform_vertex(rotation(y*0.001,camera.get_horizontal()));
        this.transform_vertex(rotation(x*0.001,camera.get_vertical()));
        this.transform_vertex(rotation(y*0.001,camera.get_horizontal()));
    },
    function (x,y) {
        this.style = "rgba(0,0,0,0)";
    }
);

