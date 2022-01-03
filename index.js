const pSBC = (p,c0,c1,l) => {
    let r,g,b,P,f,t,h,i=parseInt,m=Math.round,a=typeof(c1)=="string";
    if(typeof(p)!="number"||p<-1||p>1||typeof(c0)!="string"||(c0[0]!='r'&&c0[0]!='#')||(c1&&!a))return null;
    if(!this.pSBCr)this.pSBCr=(d)=>{
        let n=d.length,x={};
        if(n>9){
            [r,g,b,a]=d=d.split(","),n=d.length;
            if(n<3||n>4)return null;
            x.r=i(r[3]=="a"?r.slice(5):r.slice(4)),x.g=i(g),x.b=i(b),x.a=a?parseFloat(a):-1
        }else{
            if(n==8||n==6||n<4)return null;
            if(n<6)d="#"+d[1]+d[1]+d[2]+d[2]+d[3]+d[3]+(n>4?d[4]+d[4]:"");
            d=i(d.slice(1),16);
            if(n==9||n==5)x.r=d>>24&255,x.g=d>>16&255,x.b=d>>8&255,x.a=m((d&255)/0.255)/1000;
            else x.r=d>>16,x.g=d>>8&255,x.b=d&255,x.a=-1
        }return x};
    h=c0.length>9,h=a?c1.length>9?true:c1=="c"?!h:false:h,f=this.pSBCr(c0),P=p<0,t=c1&&c1!="c"?this.pSBCr(c1):P?{r:0,g:0,b:0,a:-1}:{r:255,g:255,b:255,a:-1},p=P?p*-1:p,P=1-p;
    if(!f||!t)return null;
    if(l)r=m(P*f.r+p*t.r),g=m(P*f.g+p*t.g),b=m(P*f.b+p*t.b);
    else r=m((P*f.r**2+p*t.r**2)**0.5),g=m((P*f.g**2+p*t.g**2)**0.5),b=m((P*f.b**2+p*t.b**2)**0.5);
    a=f.a,t=t.a,f=a>=0||t>=0,a=f?a<0?t:t<0?a:a*P+t*p:0;
    if(h)return"rgb"+(f?"a(":"(")+r+","+g+","+b+(f?","+m(a*1000)/1000:"")+")";
    else return"#"+(4294967296+r*16777216+g*65536+b*256+(f?m(a*255):0)).toString(16).slice(1,f?undefined:-2)
}
const random = (min, max) => { // min and max included
    return Math.floor(Math.random() * (max - min + 1) + min)
}
const dist = (vectora, vectorb) => {
   return Math.sqrt(Math.pow((vectora.x - vectorb.x), 2) + Math.pow((vectora.y - vectorb.y), 2));
}

class Blob {
    constructor(id, x, y, r, color, mouseX, mouseY) {
        this.id = id;
        this.pos = {
            x: x,
            y: y
        };
        this.r = r;
        this.color = color;
        this.strokecolor = pSBC(-0.2, this.color, false, true);
        this.mouseX = mouseX;
        this.mouseY = mouseY;
    }
}

let GRID = 40*40;
let users = new Array();
let blobs = new Array();
for (let i = 0; i < 200; i++) {
    blobs.push(new Blob(i, random(-GRID, GRID), random(-GRID, GRID), 16, `rgb(${random(20 ,150).toFixed(0)},${random(20, 150).toFixed(0)},${random(20 ,150).toFixed(0)})`, 0, 0));
}

const express = require('express');
const app = express();
const server = require('http').createServer(app);

const io = require('socket.io')(server);
app.get('/agario', function (req, res) {
    res.sendFile(__dirname + '/public/index.html');
});
app.use(express.static('public'));

server.listen(3000, function () {
    console.log(`listening on *:3000`);
});

io.on('connection', function (socket) {
    console.log(`We have a new client : ${socket.id}`);
    let newblob = new Blob(socket.id, random(-GRID, GRID), random(-GRID, GRID), 32, `rgb( ${random(20 ,150).toFixed(0)} , ${random(20, 150).toFixed(0)} , ${random(20 ,150).toFixed(0)})`, 0, 0);
    users.push(newblob);

    socket.on('disconnect', function () {
      console.log(`${socket.id} just disappeared.`);
      for (let i = 0; i < users.length; i++) {
        if (users[i].id == socket.id) {
          users.splice(i, 1);
        }
      }
    });

    socket.on('dataC2S', function (data) {
      try {
        let index;
        for (let i = 0; i < users.length; i++) {
          if (users[i].id == socket.id) {
            index = i;
          }
        }
        users[index].mouseX = data.x;
        users[index].mouseY = data.y;
      } catch {} 
    });
    io.emit('dataS2C_b', blobs);
});

function ease(mouse, fullspeed) {
  if (-90 > mouse) {
    return -fullspeed;
  } else if (-90 < mouse && mouse < 90) {
    return mouse / ( 90 / fullspeed );
  } else {
    return fullspeed;
  }
}

function didCollide(Blob1, Blob2) {
  try {
    if (dist(Blob1.pos, Blob2.pos) < Math.max(Blob1.r, Blob2.r) + 0.5 * Math.min(Blob1.r, Blob2.r)) {
      return true;
    } else {
      return false;
    }
  } catch {
    
  }
}

function update() {

  for (let i = 0; i < users.length; i++) {
    let fullspeed = 20;

    if ( !((users[i].pos.x <= -GRID && users[i].mouseX < 0) || (users[i].pos.x >= GRID && users[i].mouseX > 0)) ) {
      users[i].pos.x += ease(users[i].mouseX, fullspeed);
    }
    if ( !((users[i].pos.y <= -GRID && users[i].mouseY < 0) || (users[i].pos.y >= GRID && users[i].mouseY > 0)) ) {
      users[i].pos.y += ease(users[i].mouseY, fullspeed);
    }
  }
  
  io.emit('dataS2C_u', users);
  // eat
  for (let i = 0; i < blobs.length; i++) {
    for (let j = 0; j < users.length; j++) {
      if ( didCollide(blobs[i], users[j]) ) {
        users[j].r += (-users[j].r) + Math.sqrt( users[j].r * users[j].r + blobs[i].r * blobs[i].r ); // absorption
        blobs.splice(i, 1); // remove blob
        blobs.push(new Blob(Blob.length, random(-GRID, GRID), random(-GRID, GRID), 16, `rgb(${random(20, 150).toFixed(0)},${random(20, 150).toFixed(0)},${random(20, 150).toFixed(0)})`, 0, 0)); // new blob
        io.emit('dataS2C_b', blobs); // emit blob
      }
    }
  }

  // user collision
  for (let i = 0; i < users.length; i++) {
    for (let j = 0; j < i; j++) {
      if ( didCollide(users[j], users[i]) ) {

        let bigger, smaller;
        if (users[i].r > users[j].r) {
          bigger = i;
          smaller = j;
        } else if (users[i].r == users[j].r) {
          return 0;
        } else {
          bigger = j;
          smaller = i;
        }

        io.to(users[smaller].id).emit('dead', null); // dead message
        users[bigger].r += (-users[bigger].r) + Math.sqrt(users[bigger].r * users[bigger].r + users[smaller].r * users[smaller].r);
        console.log(`${users[smaller].id} was eaten by ${users[bigger].id} :'(`);
        for (let i = 0; i < users.length; i++) {
          if (users[i].id == users[smaller].id) {
            users.splice(i, 1);
          }
        }
        io.emit('dataS2C_u', users);
      }
    }
  }

}
setInterval(update, 100);