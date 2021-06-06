"use strict"
//ball

var ballr = 100;
var line_initial = [];
var line_final = [];
var basic_line = [];
var part = [];
var angle = 0.1;
var turn = 2*3.141592654/angle + 0.17;


function ball_x1(i)
{
    return Math.sqrt (2*i/ballr-Math.pow (i/ballr,2));
}
function ball_z1(i)
{
    return 1-i/ballr;
}
function ball_x2(i)
{
    return Math.sqrt (2*(2*ballr-i)/ballr-Math.pow ((2*ballr-i)/ballr,2));
}
function ball_z2(i)
{
    return 1-i/ballr;
}
function finaltoinitial(a,b)
{
    var len;
    if(a.length < b.length)
        len = b.length;
    else
        len = a.length;

    for(var i = 0; i<len; i++)
    {
        a[i] = b[i];
    }
}



for(var i = 0; i <= 2*ballr; i++)
{
    if(i <= ballr)
    {
        basic_line.push(vector4from3(new vector3 (ball_x1(i) ,0,ball_z1(i) )));
    }
    else if(i > ballr)
    {
        basic_line.push(vector4from3(new vector3 (ball_x2(i) ,0,ball_z2(i) )));
    }
}


finaltoinitial(line_final,basic_line);
for(var j = 0; j < turn; j++)
{
    finaltoinitial(line_initial,line_final);
    for(var i = 0; i<basic_line.length; i++)
    {
        line_final.pop();
    }
    for(var i = 0; i<=2*ballr; i++)
    {
        line_final.push(line_initial[i].mul(rotation(angle,new vector3(0,0,1))));
        if(i>0 && i<=2*ballr)
        {
            part.push([new item(
                new vector3(0,0,0),
                [line_initial[i-1].to3(),line_initial[i].to3(),line_final[i].to3(),line_final[i-1].to3()],
                "rgba(255,88,88,0.5)")]);
        }
    }
}


let ball;
for (var i = 0; i < 2*ballr*turn; i++)
{
    ball = new surfaceEntity(part[i]);
}


let plane;
for(var i = -2; i <= 2; i=i+0.05)
{
    for(var j = -2; j <= 2; j=j+0.05){
        plane = new surfaceEntity(
            [new item(
                new vector3(0,0,0),
                [new vector3(i,j,0)],
                "rgba(49,192,213,0.05)"
            )]);
    }
}

let line = new surfaceEntity(
    [new item(
        new vector3(0,0,0),
        [
            new vector3(0,0,-1),
            new vector3(3,3,1)
        ],
        "rgba(11,21,23,1)"
    )]);




let point1 = new interactiveEntity(
    new vector3(0,0,0),
    [
        new vector3(0,0,-1)
    ],
    "rgba(1,0,0,0.5)",
    false,
    5,
    function(){
        this.style = "rgba(255,119,0,0.84)";
    },
    function(x, y) {
    },
    function (x,y) {
        this.style = "rgba(1,0,0,0.5)";
    }
);

let intersection = new interactiveEntity(
    new vector3(0,0,0),
    [
        new vector3(0.5454545454545454,0.5454545454545454,-0.6363636363636364)
    ],
    "rgba(1,0,0,0.5)",
    false,
    5,
    function(){
        this.style = "rgba(255,119,0,0.84)";
    },
    function(x, y) {
    },
    function (x,y) {
        this.style = "rgba(1,0,0,0.5)";
    }
);

let point2 = new interactiveEntity(
    new vector3(0,0,0),
    [
        new vector3(1.5,1.5,0)
    ],
    "rgba(1,0,0,0.5)",
    false,
    5,
    function(){
        this.style = "rgba(255,119,0,0.84)";
    },
    function(x, y) {
        surfaceArray[line.id[0]].vertex[1] = (
            vector4from3(surfaceArray[line.id[0]].vertex[1]).mul(
                translate(new vector3(-0.01 * y,-0.01 * x,0)))).to3();
        this.transform_vertex(translate(new vector3(-0.005 * y,-0.005 * x,0)));
        let v = interactiveArray[point2.id].vertex[0];
        interactiveArray[intersection.id].vertex[0] = new vector3((2*v.x)/(v.x*v.x + v.y*v.y + 1),(2*v.y)/(v.x*v.x + v.y*v.y + 1),-(v.x*v.x + v.y*v.y - 1)/(v.x*v.x + v.y*v.y + 1));
    },
    function (x,y) {
        this.style = "rgba(1,0,0,0.5)";
    }
);

