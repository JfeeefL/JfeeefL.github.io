const canvas = document.querySelector('canvas');
const device = canvas.getContext('2d');

const width = canvas.width = window.innerWidth;
const height = canvas.height = window.innerHeight;

function vec2D(x, y) {
    return {x:x, y:y};
}

function PhyAtt(pos, velocity, color) {
    return {pos : pos, velocity : velocity, color: color};
}

let renderList = [];
let deltaList = [];

function ObjectRenderer(func,ini) {
    this.data = ini;
    this.core = func;
    this.render = function() {
        device.beginPath();
        this.core(this.data);
        device.closePath();
    }

}

function ObjectDelta(func,ini) {
    this.data = ini;
    this.delta = func;
}

function GameObject() {
    this.render = null;
    this.delta = null;
    this.ini = null;
    this.activate = function() {
        console.log(this.ini);
        renderList.push(new ObjectRenderer(this.render,this.ini));
        deltaList.push(new ObjectDelta(this.delta,this.ini));
    }
}

function mainRenderer() {
    device.clearRect(0,0,canvas.width,canvas.height);
    for(let i = 0; i < deltaList.length; i ++) {
        renderList[i].data = deltaList[i].data = deltaList[i].delta(deltaList[i].data);
    }
    for(let i = 0; i < renderList.length; i ++) {
        renderList[i].render(renderList[i].data);
    }
}

let Ball = new GameObject;
Ball.render = function (obj) {
    device.arc(obj.pos.x, obj.pos.y, 10, 0, 2* Math.PI);
    device.fillStyle = obj.color;
    device.fill();
};
Ball.delta = function(obj) {
    obj.pos.x += obj.velocity.x;
    obj.pos.y += obj.velocity.y;
    if(obj.pos.x < 0) {
        obj.pos.x = 0;
        obj.velocity.x *= -1;
    } else if(obj.pos.x > width){
        obj.pos.x = width;
        obj.velocity.x *= -1;
    }

    if(obj.pos.y < 0) {
        obj.pos.y = 0;
        obj.velocity.y *= -1;
    } else if(obj.pos.y > height){
        obj.pos.y = height;
        obj.velocity.y *= -1;
    }
    return obj;
};

function random(l, r) {
    return l+Math.floor((r-l)*Math.random());
}

for(let i = 0; i < 30; i ++) {
    Ball.ini = PhyAtt(
        vec2D(random(0,width), random(0,height)),
        vec2D(random(-5, 5), random(-5, 5)),
        "rgb("+random(0,255)+","+random(0,255)+","+random(0,255)+")"
    );
    Ball.activate();
}


setInterval(mainRenderer,10);