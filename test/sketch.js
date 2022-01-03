let blob = [], blobs = new Array();
let id = '';
let idindex;
let zoom = 1;

let socket;

function show(blob) {
    strokeWeight(blob.r / 5);
    stroke(blob.strokecolor);
    fill(blob.color);
    ellipse(blob.pos.x, blob.pos.y, blob.r*2, blob.r*2);
}

function setup() {
    createCanvas(window.innerWidth, window.innerHeight);
    colorMode(RGB);
    socket = io.connect('http://localhost:3000/');
    socket.emit('getblobs', null);
    socket.on('blobslist', function (data1, data2, userid) {
        blobs = data1;
        blob = data2;
        id = userid;
        for (let i = 0; i < blob.length; i++) {
            if (blob[i].id == id) {
                idindex = i;
            }
        }
    });
    socket.on('result', function (data1, data2) {
        blobs = data1;
        blob = data1;
        for (let i = 0; i < blob.length; i++) {
            if (blob[i].id == id) {
                idindex = i;
            }
        }
    })
}

function draw() {
    if (blob.length < 1) {
        return 0;
    }
    background("#CFCFCF");

    translate(width/2, height/2);

    zoom = lerp(zoom, 64 / blob[idindex].r, 0.01);
    scale(zoom);
    translate(-blob[idindex].pos.x, -blob[idindex].pos.y);

    // grid
    stroke('rgb(137,137,137)');
    strokeWeight(1);
    for (let i = -GRID; i <= GRID; i += 64) {
        line(i, GRID, i, -GRID);
    }

    for (let i = -GRID; i <= GRID; i += 64) {
        line(-GRID, i, GRID, i);
    }


    show(blob);
    for (let i = 0; i < blobs.length; i++) {
        show(blobs[i]);
    }
}

function show(object) {
    strokeWeight(object.r / 5);
    stroke(object.strokecolor);
    fill(object.color);
    ellipse(object.pos.x, object.pos.y, object.r*2, object.r*2);
}

function eats(object1, object2) {
    let d = dist(this.pos, other.pos);
        if (d < this.r + other.r) {
            this.r += ((-this.r)+Math.sqrt(this.r*this.r+other.r*other.r))
            blobs.push(new Blob(random(-GRID*width, GRID*width), random(-GRID*height, GRID*height), 32, `rgb( ${random(20 ,150).toFixed(0)} , ${random(20, 150).toFixed(0)} , ${random(20 ,150).toFixed(0)})`))
            return true;
        } else {
            return false;
        }
}
