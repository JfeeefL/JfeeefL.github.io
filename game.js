const canvas = document.querySelector('canvas');
const device = canvas.getContext('2d');

const stageWidth = canvas.width = window.innerWidth;
const stageHeight = canvas.height = window.innerHeight;

function FrameActor(attribute, updater, renderer) {
    this.attribute = attribute;
    this.updater = updater;
    this.renderer = renderer;
    this.id = 0;
}

let frameActorList = [];

function activate (frameActor) {
    frameActorList.push(frameActor);
}

function mainRenderer() {
    for(let i = 0; i < frameActorList.length; i ++)
        frameActorList[i].updater(frameActorList[i].attribute);
    device.clearRect(0,0, stageWidth,stageHeight);
    for(let i = 0; i < frameActorList.length; i ++)
        frameActorList[i].renderer(frameActorList[i].attribute);
}

setInterval(mainRenderer, 10);

//====================| vec2D |=======================//

function Vec2D(x, y) {
    this.x = x;
    this.y = y;
}

//====================| vec2D END |=======================//

let arrowVec = new Vec2D(0,0);
function nullFunction() {}

//====================| MOUSE ACTOR : ID = 0 |=======================//

let mouseAttribute = {
    pos: arrowVec,
    maxR: 20,
    minR: 15,
    r: 15,
    inc: 0.1,
    id : 0
};

function mouseUpdater (attr) {
    attr.r += attr.inc;
    if(attr.r > attr.maxR || attr.r < attr.minR) attr.inc*=-1;
}

function mouseRenderer(attr) {
    device.beginPath();
    device.arc(attr.pos.x, attr.pos.y, attr.r, 0, Math.PI * 2);
    device.strokeStyle = 'rgba(50, 100, 100, 0.5)';
    device.stroke();
    device.closePath();
}

activate(new FrameActor(mouseAttribute, mouseUpdater, mouseRenderer));

//====================| MOUSE ACTOR END : ID = 0 |=======================//

//====================| ARROW ACTOR : ID = 1 |=======================//

let arrowAttribute = {
    start: new Vec2D(0,0),
    end: arrowVec,
    id: 1
};

function arrowRenderer(attr) {
    device.beginPath();
    device.moveTo(attr.start.x, attr.start.y);
    device.lineTo(attr.end.x, attr.end.y);
    device.stroke();
    device.closePath();
}

activate(new FrameActor(arrowAttribute, nullFunction, nullFunction));

//====================| ARROW ACTOR END : ID = 1 |=======================//

document.addEventListener('mousemove', function(e) {
    arrowVec.x = e.clientX-canvas.offsetLeft;
    arrowVec.y = e.clientY-canvas.offsetTop;
});

document.addEventListener('mousedown', function (e) {
    arrowAttribute.start.x = arrowVec.x;
    arrowAttribute.start.y = arrowVec.y;
    frameActorList[1].renderer = arrowRenderer;
});

document.addEventListener('mouseup', function (e) {
    frameActorList[1].renderer = nullFunction;
});