'use strict';

const canvas = document.querySelector('canvas');
const device = canvas.getContext('2d');
canvas.width = window.innerWidth * 0.70;
canvas.height = window.innerHeight * 0.85;

device.fillStyle = "rgb(255,255,255)";
device.fillRect(0,0,canvas.width, canvas.height);

function vector2(x, y) {
    this.x = x; this.y = y;
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
    look_at: new vector3(1,0,0),
    position: new vector3(-200,0,0),
    point_xy: function(p) {
        let horizontal = this.look_at.crs(new vector3(0,0,1));
        let vertical = this.look_at.crs(horizontal);
        horizontal = horizontal.normalize();
        vertical = vertical.normalize();
        let rel = p.sub(this.position);
        let len = this.look_at.dot(rel);
        let x = rel.dot(horizontal);
        let y = rel.dot(vertical);
        return new vector3(x/len*100, - y/len*100, len);
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

let screenCenter = new vector3(canvas.width/2, canvas.height/2,0);

let screen = {
    draw_point: function(p, radius, color) {
        p = p.sum(screenCenter);
        device.beginPath();
        device.arc(p.x, p.y, radius, 0, Math.PI * 2);
        device.fillStyle  = color;
        device.fill();
        device.closePath();
    },
    draw_line: function (p1, p2, color) {
        p1 = p1.sum(screenCenter);
        p2 = p2.sum(screenCenter);
        device.beginPath();
        device.fillStyle = color;
        device.moveTo(p1.x, p1.y);
        device.lineTo(p2.x, p2.y);
        device.stroke();
        device.closePath();
    },
    draw_poly: function (arr, color) {
        for(let i = 0; i < arr.length; i ++) {
            arr[i] = arr[i].sum(screenCenter);
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

function item(position, vertex, style) {
    this.position = position;
    this.vertex = vertex;
    this.style = style;
}

item.prototype = {
  transform_vertex: function(m) {
      for(let i in this.vertex) {
          this.vertex[i] = vector4from3(this.vertex[i]).mul(m).to3();
      }
  },
  transform_pos: function(m) {
      this.position = (vector4from3(this.position).mul(m)).to3();
  }
};

let surfaceArray = new Array();

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
},10);
//cube
//top
surfaceArray.push(
    new item(
        new vector3(200,0,0),
        [
            new vector3(-100, -100, 100),
            new vector3(-100, 100, 100),
            new vector3(100, 100, 100),
            new vector3(100, -100, 100),
        ],
        "rgba(255,88,88,0.5)"
    )
);
//bottom
surfaceArray.push(
    new item(
        new vector3(200,0,0),
        [
            new vector3(-100, -100, -100),
            new vector3(-100, 100, -100),
            new vector3(100, 100, -100),
            new vector3(100, -100, -100),
        ],
        "rgba(71,220,153,0.5)"
    )
);
//front
surfaceArray.push(
    new item(
        new vector3(200,0,0),
        [
            new vector3(-100, -100, 100),
            new vector3(-100, 100, 100),
            new vector3(-100, 100, -100),
            new vector3(-100, -100, -100),
        ],
        "rgba(213,119,229,0.5)"
    )
);
//back
surfaceArray.push(
    new item(
        new vector3(200,0,0),
        [
            new vector3(100, -100, 100),
            new vector3(100, 100, 100),
            new vector3(100, 100, -100),
            new vector3(100, -100, -100),
        ],
        "rgba(255,128,63,0.5)"
    )
);
//left
surfaceArray.push(
    new item(
        new vector3(200,0,0),
        [
            new vector3(-100, -100, 100),
            new vector3(-100, -100, -100),
            new vector3(100, -100, -100),
            new vector3(100, -100, 100),
        ],
        "rgba(209,255,98,0.5)"
    )
);

//right
surfaceArray.push(
    new item(
        new vector3(200,0,0),
        [
            new vector3(-100, 100, 100),
            new vector3(-100, 100, -100),
            new vector3(100, 100, -100),
            new vector3(100, 100, 100),
        ],
        "rgba(94,197,231,0.5)"
    )
);

let move_mode
let is_mousedown;
let mouse_X, mouse_Y;

document.addEventListener('mousedown', function (event) {
    is_mousedown = true;
    mouse_X = event.clientX;
    mouse_Y = event.clientY;
});

document.addEventListener('mouseup', function (event) {
    is_mousedown = false;
    mouse_X = event.clientX;
    mouse_Y = event.clientY;
});

document.addEventListener('mousemove',function(event) {
    for (let i in surfaceArray) {
        surfaceArray[i].transform_vertex(rotationZ(0.1));
    }
    if(is_mousedown) {
        if(move_mode === 'translation') {
         //   camera.translation(event.movementX, event.movementY);
        }
        else if(move_mode ==='rotate') {
         //   camera.rotate(event.movementX, event.movementY);
        }
    }
});