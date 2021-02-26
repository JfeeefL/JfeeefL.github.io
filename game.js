//Library code:
const canvas = document.querySelector('canvas');
const device = canvas.getContext('2d');

const stageWidth = canvas.width = window.innerWidth;
const stageHeight = canvas.height = window.innerHeight;

let ActorList = [];

function Actor (attribute, renderer, matrix) {
    this.attribute = attribute;
    this.renderer = renderer;
    this.matrix = matrix;
};

let activate = function (actor) {
    ActorList.push(new Actor(actor.attribute, actor.renderer, actor.matrix));
    ActorList[ActorList.length-1].attribute.id = ActorList.length-1;
}

function mainRenderer() {
    for(let i = 0; i < ActorList.length; i ++) {
        ActorList[i].matrix(ActorList[i].attribute);
    }
    device.clearRect(0,0, stageWidth, stageHeight);
    for(let i = 0; i < ActorList.length; i ++) {
        ActorList[i].renderer(ActorList[i].attribute);
    }
}

const timeInterval = 10;

setInterval(mainRenderer,timeInterval);
//Library code end


//-------------------------------------------------------------------------------------
//user's code:

function vec2D(x, y) {
    return {x:x, y:y};
}

function sqr(x) {return x*x;}

function distance(p1, p2) {
    return Math.sqrt(sqr(p1.x-p2.x)+sqr(p1.y-p2.y));
}

function dot(p1, p2) {
    return p1.x*p2.x + p1.y*p2.y;
}

function multiply(p, x) {
    return {x: p.x*x, y: p.y*x};
}

function plus(a, b) {
    return {x: a.x + b.x, y: a.y + b.y};
}

function minus(a, b) {
    return {x: a.x - b.x, y: a.y - b.y};
}

function assign(a, b) {
    a.x = b.x;
    a.y = b.y;
}

function normalize(p) {
    assign(p,multiply(p,1/distance(vec2D(0,0), p)));
}

//------------------------------------------------------------------
function reflect(p, normal) {
    let middle = multiply(normal, dot(p, normal));
    assign(p, plus(middle, minus(middle, p)));
}

function ballCollision(b1, b2, col) {
    if(b1.r + b2.r < distance(b1.p, b2.p)) return false;
    if(col) return true;
    let normal = minus(b1.p, b2.p);
    normalize(normal);
    reflect(b1.v, normal);
    return true;
}

let Ball = new Actor(
    null,
    function(attr) {
        device.beginPath();
        device.arc(attr.p.x, attr.p.y, attr.r,0,2*Math.PI);
        device.fillStyle = attr.color;
        device.fill();
        device.closePath();
    },
    function (attr) {
        assign(attr.p, plus(attr.p,attr.v));
        if(attr.p.x - attr.r < 0 || attr.p.x + attr.r > stageWidth) attr.v.x *= -1;
        if(attr.p.y - attr.r < 0 || attr.p.y + attr.r > stageHeight)attr.v.y *= -1;
        for(let i = 0; i < ActorList.length; i ++) {
            if(attr.id === i) continue;
            if(ballCollision(attr, ActorList[i].attribute, attr.collide.has(i))) attr.collide.add(i);
            else attr.collide.delete(i);
        }
    }
);

function random(l, r) {
    return l+(r-l)*Math.random();
}

for(let i = 0; i < 50; i ++) {
    Ball.attribute = {
        p:vec2D(random(0+20,stageWidth-20), random(0+20,stageHeight-20)),
        v:vec2D(random(-2,2), random(-2,2)),
        r: random(10,20),
        color: 'rgb('+random(0,255)+','+random(0,255)+','+random(0,255)+')',
        collide: new Set()
    };
    activate(Ball);
}

