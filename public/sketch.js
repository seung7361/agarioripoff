const socket = io.connect(window.location.href);
let myindex, sessionID;
let zoom = 1;
let users = new Array();
let blobs = new Array();
let copy, togo;
let idx = 0;
const lerp = (x, y, a) => x * (1 - a) + y * a;
const GRID = 40*40;
// let myname;

// while (myname == null || myname == '') {
//   myname = window.prompt('How can I call you?');
// }

socket.on('connection', function () {
  console.log('A G A R . I O    R I P O F F');
});

socket.on('dataS2C_u', function (data1) {
  idx = 0;
  for (let i = 0; i < users.length; i++) {
    if (users[i].id == socket.id) {
      myindex = i;
    }
  }

  if (users.length != data1.length) {
    users = data1;
  } else {
    for (let i = 0; i < users.length; i++) {
      copy = users;
      togo = data1;
      users[i].pos.x = lerp(copy[i].pos.x, togo[i].pos.x, 0);
      users[i].pos.y = lerp(copy[i].pos.y, togo[i].pos.y, 0);
      users[i].r = togo[i].r;
    }
  }
});

socket.on('dataS2C_b', function (data2) {
  blobs = data2;
});

socket.on('dead', function () {
  noLoop();
  clearInterval(updateinterval);
  alert('You are dead.');
  window.location.reload();
});

function update() {
  let xpos = mouseX - width/2;
  let ypos = mouseY - height/2;

  socket.emit('dataC2S', { x: xpos, y: ypos });
}
let updateinterval = setInterval(update, 100);

function show(blob) {
    strokeWeight(blob.r / 5);
    stroke(blob.strokecolor);
    fill(blob.color);
    ellipse(blob.pos.x, blob.pos.y, blob.r*2, blob.r*2);
}

function setup() {
  createCanvas(window.innerWidth, window.innerHeight);
  colorMode(RGB);
  frameRate(60);
}

function draw() {
  background("#CFCFCF");
  idx += 1/60;
  if (blobs.length < 1) {
      return 0;
  }
  
  try {
    for (let i = 0; i < users.length; i++) {
      users[i].pos.x = lerp(copy[i].pos.x, togo[i].pos.x, idx);
      users[i].pos.y = lerp(copy[i].pos.y, togo[i].pos.y, idx);
    }
    fill('rgb(89,89,89)');
    rect(width-300, 0, 300, 300);

    textAlign(CENTER);
    textSize(30);
    fill('rgb(0, 0, 0)')
    text(`Players : ${users.length}`, width-150, 45);

    textarea = ``;
    for (let i = 0; i < users.length; i++) {
      textarea += `${i+1}. ${users[i].id}\n`;
    }
    textAlign(LEFT);
    textSize(20);
    text(textarea, width - 280, 100);

    textAlign(CENTER);
    translate(width/2, height/2);
    zoom = lerp(zoom, (64 / users[myindex].r)*1.5, 0.01);
    scale(zoom);
    translate(-users[myindex].pos.x, -users[myindex].pos.y);
  } catch {}

  // grid
  stroke('rgb(137,137,137)');
  strokeWeight(1);
  for (let i = -GRID; i <= GRID; i += 64) {
      line(i, GRID, i, -GRID);
  }

  for (let i = -GRID; i <= GRID; i += 64) {
      line(-GRID, i, GRID, i);
  }


  for (let i = 0; i < blobs.length; i++) {
    show(blobs[i]);
  }
  for (let i = 0; i < users.length; i++) {
    show(users[i]);
    noStroke();
    fill('rgb(0,0,0)');
    textSize(users[i].r / 3);
    text(`${users[i].id}`, users[i].pos.x, users[i].pos.y + users[i].r/6);
}

  textSize(10);
  fill('rgb(0, 0, 0)');
  noStroke();
  textAlign(CENTER);
}
