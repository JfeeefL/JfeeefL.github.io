'use strict';

const canvas = document.querySelector('canvas');
const device = canvas.getContext('2d');
canvas.width = window.innerWidth * 0.68;
canvas.height = window.innerHeight * 0.80-20;

device.fillStyle = "rgb(255,255,255)";
device.fillRect(0,0,canvas.width, canvas.height);

function vector2(x, y) {
    this.x = x; this.y = y;
}

vector2.prototype = {
    copy: function () { return new vector2(this.x, this.y); },
    sum: function (v) { return new vector2(this.x + v.x, this.y + v.y); },
    opp: function() { return new vector2(- this.x, - this.y) },
    sub: function (v) { return this.sum(v.opp()); },
    dot: function (v) { return this.x * v.x + this.y * v.y; },
    mul: function(a) { return new vector2(this.x * a, this.y * a);},
    crs: function(v) { return this.x * v.y - this.y * v.x;},
    normalize : function () {
        let t = Math.sqrt(this.x*this.x + this.y*this.y);
        return new vector2(this.x / t, this.y / t);
    }
}

function vector3(x, y, z) {
    this.x = x; this.y = y; this.z = z;
}

vector3.prototype = {
    copy: function () { return new vector3(this.x, this.y, this.z); },
    sum: function (v) { return new vector3(this.x + v.x, this.y + v.y, this.z + v.z); },
    opp: function() { return new vector3(- this.x, - this.y, - this.z) },
    sub: function (v) { return this.sum(v.opp()); },
    dot: function (v) { return this.x * v.x + this.y * v.y + this.z * v.z; },
    mul: function(a) { return new vector3(this.x * a, this.y * a, this.z * a);},
    crs: function(v) { return new  vector3(
        this.y * v.z - this.z * v.y,
        this.z * v.x - this.x * v.z,
        this.x * v.y - this.y * v.x);},
    normalize : function () {
        let t = Math.sqrt(this.x*this.x + this.y*this.y + this.z*this.z);
        return new vector3(this.x / t, this.y / t, this.z / t);
    }
};

function matrix4(m) {
    this.m = m;
}

let unitMatrix = new matrix4([
    [1,0,0,0],
    [0,1,0,0],
    [0,0,1,0],
    [0,0,0,1]
]);

function rotationX(theta) {
    let x = Math.cos(theta), y = Math.sin(theta);
    return new matrix4([
        [1,0,0,0],
        [0,x,-y,0],
        [0,y,x,0],
        [0,0,0,1]
    ]);
}

function rotationY(theta) {
    let x = Math.cos(theta), y = Math.sin(theta);
    return new matrix4([
        [x,0,-y,0],
        [0,1,0,0],
        [y,0,x,0],
        [0,0,0,1]
    ]);
}

function rotationZ(theta) {
    let x = Math.cos(theta), y = Math.sin(theta);
    return new matrix4([
        [x,-y,0,0],
        [y,x,0,0],
        [0,0,1,0],
        [0,0,0,1]
    ]);
}

function rotation(theta, n) {
    let x = Math.cos(theta), y = Math.sin(theta);
    return new matrix4([
        [       n.x*n.x*(1-x)+x, n.x*n.y*(1-x)+n.z*y, n.x*n.z*(1-x)-n.y*y,      0],
        [   n.x*n.y*(1-x)-n.z*y,     n.y*n.y*(1-x)+x, n.y*n.z*(1-x)+n.x*y,      0],
        [   n.x*n.z*(1-x)+n.y*y, n.y*n.z*(1-x)-n.x*y,     n.z*n.z*(1-x)+x,      0],
        [                     0,                   0,                   0,      1]
    ]);
}

function translate(v) {
    return new matrix4([
        [1,0,0,v.x],
        [0,1,0,v.y],
        [0,0,1,v.z],
        [0,0,0,1]
    ]);
}

matrix4.prototype = {
    mul: function (a) {
        let r = new matrix4();
        for(let i = 0; i < 4; i ++) {
            for(let j = 0; j < 4; j ++) {
                r.m[i][j] = 0;
                for(let k = 0; k < 4; k ++) {
                    r.m[i][j] += a.m[i][k] * this.m[k][j];
                }
            }
        }
        return r;
    },
    scl: function (a) {
        let r = new matrix4();
        for(let i = 0; i < 4; i ++) {
            for(let j = 0; j < 4; j ++) {
                r.m[i][j] = this.m[i][j] * a;
            }
        }
    }
}

function vector4(x, y, z, w) {
    this.x = x; this.y = y; this.z = z; this.w = w;
}
function vector4from3(a) {
    return new vector4(a.x, a.y, a.z, 1);
}
vector4.prototype = {
    copy: function () { return new vector4(this.x, this.y, this.z, this.w); },
    to3: function () { return new vector3(this.x, this.y, this.z); },
    mul: function (a) {
        let r = [0,0,0,0], t = [this.x, this.y, this.z, this.w];
        for(let i = 0; i < 4; i ++) {
            for(let j = 0; j < 4; j ++) {
                r[i] += a.m[i][j]*t[j]
            }
        }
        return new vector4(r[0], r[1], r[2], r[3]);
    }
};

let camera = {
    look_at: (new vector3(1,0,0)).normalize(),
    position: new vector3(-3,0,0),
    get_horizontal: function() {
        let horizontal = this.look_at.crs(new vector3(0,0,1));
        return horizontal.normalize();
    },
    get_vertical: function() {
        let horizontal = this.look_at.crs(new vector3(0,0,1));
        let vertical = this.look_at.crs(horizontal);
        return vertical.normalize();
    },
    point_xy: function(p) {
        let horizontal = this.look_at.crs(new vector3(0,0,1));
        let vertical = this.look_at.crs(horizontal);
        horizontal = horizontal.normalize();
        vertical = vertical.normalize();
        let rel = p.sub(this.position);
        let len = this.look_at.dot(rel);
        let x = rel.dot(horizontal);
        let y = rel.dot(vertical);
        return new vector3(x/len*500, - y/len*500, len);
    },
    transform_look_at: function(m) {
        let t = (vector4from3(this.look_at).mul(m)).to3();
        t = t.normalize();
        if(Math.abs(t.dot(new vector3(0,0,1))) > 0.95) return;
        this.look_at = t;
    },
    transform_position: function(m) {
        this.position = (vector4from3(this.position).mul(m)).to3();
    }
};

let screenCenter = function() {
    return new vector3(canvas.width/2, canvas.height/2,0);
}

let screen = {
    draw_point: function(p, radius, color) {
        p = p.sum(screenCenter());
        device.beginPath();
        device.arc(p.x, p.y, radius, 0, Math.PI * 2);
        device.fillStyle  = color;
        device.fill();
        device.closePath();
    },
    draw_line: function (p1, p2, color) {
        p1 = p1.sum(screenCenter());
        p2 = p2.sum(screenCenter());
        device.beginPath();
        device.fillStyle = color;
        device.moveTo(p1.x, p1.y);
        device.lineTo(p2.x, p2.y);
        device.stroke();
        device.closePath();
    },
    draw_poly: function (arr, color) {
        for(let i = 0; i < arr.length; i ++) {
            arr[i] = arr[i].sum(screenCenter());
        }
        device.beginPath();
        device.fillStyle = color;
        device.moveTo(arr[arr.length-1].x, arr[arr.length-1].y);
        for(let i = 0; i < arr.length; i ++) {
            device.lineTo(arr[i].x, arr[i].y);
        }
        device.fill();
        device.closePath();
    }
};

let interactiveArray = new Array();

function item(position,
              vertex,
              style = 'rgba(0,0,0,0.1)',
              fix2d = false,
              radius = 10,
              onClick = function(x,y){},
              onMove = function(x,y){},
              onRelease = function(x,y) {}) {
    this.position = position;
    this.vertex = vertex;
    this.style = style;
    if(fix2d) this.fix2d = fix2d;
    this.radius = radius;
    this.isClicked = false;
    this.onClick = onClick;
    this.onMove = onMove;
    this.onRelease = onRelease;
}

item.prototype = {
  transform_vertex: function(m) {
      for(let i in this.vertex) {
          this.vertex[i] = vector4from3(this.vertex[i]).mul(m).to3();
      }
  },
  transform_position: function(m) {
      this.position = (vector4from3(this.position).mul(m)).to3();
  }
};

function interactiveEntity(position,
                           vertexArray,
                           style = 'rgba(0,0,0,0.1)',
                           fix2d = false,
                           radius = 10,
                           onClick = function(x,y){},
                           onMove = function(x,y) {},
                           onRelease = function (x,y) {}
                           ) {
    this.id = new Array();
    for(let i of vertexArray) {
        this.id.push(interactiveArray.length);
        interactiveArray.push(
            new item(position, vertexArray, style, fix2d, radius, onClick, onMove, onRelease)
        );
    }
}

interactiveEntity.prototype = {
    transform_vertex: function (m) {
        for(let i of this.id) {
            interactiveArray[i].transform_vertex(m);
        }
    },
    transform_position(m) {
        for(let i of this.id) {
            interactiveArray[i].transform_position(m);
        }
    }
};

let surfaceArray = new Array();

function surfaceEntity(array) {
    this.id = new Array();
    for(let i of array) {
        this.id.push(surfaceArray.length);
        surfaceArray.push(i);
    }
}

surfaceEntity.prototype = {
    transform_vertex: function (m) {
        for(let i of this.id) {
            surfaceArray[i].transform_vertex(m);
        }
    },
    transform_position(m) {
        for(let i of this.id) {
            surfaceArray[i].transform_position(m);
        }
    }
};


setInterval(function () {
    device.fillStyle = "rgb(255,255,255)";
    device.fillRect(0,0,canvas.width, canvas.height);
    let scr = new Array();
    for(let i of surfaceArray) {
        let t = new Array();
        let k = false;
        for(let j of i.vertex) {
            let p = camera.point_xy(j.sum(i.position));
            if (p.z > 0) {
                t.push(p);
            } else {
                k = true;
                break;
            }
        }
        if(k === false) {
            scr.push(new item(null, t, i.style));
        }
    }
    scr.sort(function (a,b) {
        let va = 0, vb = 0;
        for(let i of a.vertex) {
            va = Math.max(va, i.z);
        }
        for(let i of b.vertex) {
            vb = Math.max(vb, i.z);
        }
        return vb - va;
    });
    for(let i of scr) {
        if(i.vertex.length === 1) {
            screen.draw_point(i.vertex[0],10, i.style);
        } else if(i.vertex.length === 2) {
            screen.draw_line(i.vertex[0], i.vertex[1], i.style);
        } else {
            screen.draw_poly(i.vertex, i.style);
        }
    }

    for(let i of interactiveArray) {
        if(i.radius === 0) continue;
        if(i.fix2d === true) {
            for(let j of i.vertex) {
                screen.draw_point(j.sum(i.position), i.radius, i.style);
            }
        } else {
            for(let j of i.vertex) {
                screen.draw_point(camera.point_xy(j.sum(i.position)), i.radius, i.style);
            }
        }
    }

},10);

let move_mode = 'rotate';
let is_mousedown;
let mouse_X, mouse_Y;
let canvasX, canvasY;

function mousedownInteraction(event) {
    is_mousedown = true;
    mouse_X = event.pageX;
    mouse_Y = event.pageY;

    let click = canvas.getBoundingClientRect();
    canvasY = event.clientY - click.top;
    canvasX = event.clientX - click.left;
    for(let i of interactiveArray) {
        i.isClicked = false;
        for(let j of i.vertex) {
            let t = camera.point_xy(j.sum(i.position)).sum(screenCenter());
            let dx = (t.x - canvasX);
            let dy = (t.y - canvasY)
            if(dx*dx + dy*dy <= i.radius * i.radius) {
                i.isClicked = true;
                break;
            }
        }
        if(i.isClicked === true) {
            i.onClick(canvasX, canvasY);
        }
    }
}

function mouseupInteraction(event) {
    is_mousedown = false;
    mouse_X = event.pageX;
    mouse_Y = event.pageY;

    let click = canvas.getBoundingClientRect();
    canvasY = event.clientY - click.top;
    canvasX = event.clientX - click.left;
    for(let i of interactiveArray) {
        if(i.isClicked === true) {
            i.onRelease(canvasX, canvasY);
        }
        i.isClicked = false;
    }
}

canvas.addEventListener('mousedown', mousedownInteraction );

document.addEventListener('mouseup', mouseupInteraction );

canvas.addEventListener('touchstart', mousedownInteraction);

document.addEventListener('touchend', mouseupInteraction);

let rotateButton = document.querySelector('#rotate');
let translateButton = document.querySelector('#translate');

rotateButton.style.backgroundColor = 'rgb(206,108,108)';

function rotateInteraction() {
    translateButton.style.backgroundColor = '#74c0fd';
    rotateButton.style.backgroundColor = 'rgb(206,108,108)';
    move_mode = 'rotate';
}

function translateInteraction() {
    translateButton.style.backgroundColor = 'rgb(206,108,108)';
    rotateButton.style.backgroundColor = '#74c0fd';
    move_mode = 'translate'
}

rotateButton.addEventListener('click', rotateInteraction );
//rotateButton.addEventListener('touchenter', rotateInteraction );

translateButton.addEventListener('click', translateInteraction );
//translateButton.addEventListener('touchleave', translateInteraction );

function dragInteraction(event) {
    if(is_mousedown) {
        let moveX = event.pageX-mouse_X;
        let moveY = event.pageY-mouse_Y;

        mouse_X += moveX;
        mouse_Y += moveY;

        canvasX += moveX;
        canvasY += moveY;

        let click = false;

        for(let i of interactiveArray) {
            if(i.isClicked) {
                i.onMove(moveX, moveY);
                click = true;
            }
        }
        if(click) return;

        if(move_mode === 'translate') {
            camera.transform_position(translate(camera.get_horizontal().mul(-moveX*0.008)));
            camera.transform_position(translate(camera.get_vertical().mul(moveY*0.008)));
        }
        else if(move_mode ==='rotate') {

            camera.transform_look_at(rotationZ(moveX*0.002));
            camera.transform_look_at(rotation(moveY*0.002, camera.get_horizontal()));

        }
    }
}

document.addEventListener('mousemove',dragInteraction);
canvas.addEventListener('ontouchmove', dragInteraction);

window.onresize = function() {
    canvas.width = window.innerWidth * 0.68;
    canvas.height = window.innerHeight * 0.80-20;
}