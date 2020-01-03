/* @author 
 * 
 * @3bute <fiedelferro@gmail.com>
 *
 */

var ax,
  ay,
  w,
  h,
  scl,
  cvs,
  ctx,
  res,
  currentRes,
  degrad,
  dev0,
  dev1,
  dev3,
  dev4,
  coords = [],
  hold = false,
  timer = false,
  iter,
  iPressed,
  closed = false,
  sat = 126,
  Hue = 170,
  Value = 255,
  zoomed = 0,
  oldMouseX,
  oldMouseY,
  dragged,
  midbutton = false,
  prevColors = null,
  bw = false,
  dark = false,
  workers = 1,
  busy = false,
  stop = false,
  magnif = false,
  h0 = 0, w0 = 0,
  prec = 8,
  proc;

function show() {
  dev1.style.display = "block";
}
function unshow() {
  dev1.style.display = "none";
}
function stopCalc() {
  stop = true;
}

//keyboard control stuff
document.addEventListener("keyup", e => {
  if (event.keyCode == 17) {
    document.body.style.cursor = "cell";
    setTimeout(() => {
      dragged = false;
    }, 10);
    return;
  }
});
document.addEventListener("keydown", event => {
  if (busy) {
    if (event.keyCode == 88) {
      stopCalc();
    }
    return;
  }
  if (event.keyCode == 76) {
    if (degrad < 130) degrad++;
    updateInformation();
    dropSet();
    return;
  }
  if (event.keyCode == 79) {
    if (degrad > 1) degrad--;
    else degrad = 1;
    updateInformation();
    dropSet();
    return;
  }
  if (event.keyCode == 75 && iPressed) {
    if (iter > 100) iter -= 100;
    updateInformation();
    return;
  }
  if (event.keyCode == 75 && !iPressed) {
    if (iter > 10) iter -= 10;
    dropSet();
    iPressed = true;
    setTimeout(() => {
      iPressed = false;
    }, 200);
    updateInformation();
    return;
  }
  if (event.keyCode == 73 && iPressed) {
    iter += 100;
    updateInformation();
    return;
  }
  if (event.keyCode == 73 && !iPressed) {
    iter += 10;
    dropSet();
    iPressed = true;
    setTimeout(() => {
      iPressed = false;
    }, 200);
    updateInformation();
    return;
  }
  if (event.keyCode == 67) {
    if (scl > 1) scl--;
    updateInformation();
    magnif = true;
    drawMagnifier();
    return;
  }
  if (event.keyCode == 86) {
    scl++;
    updateInformation();
    magnif = true;
    drawMagnifier();
    return;
  }

  if (event.keyCode == 69) {
    if (dev3.style.display == "block") {
      dev3.style.display = "none";
    } else {
      dev3.style.display = "block";
    }
    return;
  }
  if (event.keyCode == 71) {
    if (sat < 255) sat += 5;
    else sat = 0;
    checkColor();
    dropSet();
    updateInformation();
    return;
  }
  if (event.keyCode == 68) {
    saveCanvas(cvs, "mandelbrot", "jpg");
    return;
  }
  if (event.keyCode == 17) {
    dragged = true;
    document.body.style.cursor = "move";
    return;
  }
  if (event.keyCode == 72) {
    if (Hue > 255) Hue = 0;
    else Hue += 5;
    checkColor();
    dropSet();
    updateInformation();
    return;
  }
  if (event.keyCode == 74) {
    if (Value > 255) Value = 0;
    else Value += 5;
    checkColor();
    dropSet();
    updateInformation();
    return;
  }
  if (event.keyCode == 49) {
    if (prevColors) {
      Hue = prevColors.Hue;
      sat = prevColors.sat;
      Value = prevColors.Value;
      prevColors = null;
      bw = false;
      dropSet();
    } else {
      prevColors = {};
      (prevColors.Hue = Hue), (prevColors.sat = sat);
      prevColors.Value = Value;
      bw = true;
      dropSet();
    }
    return;
  }
  if (event.keyCode == 50) {
    dark = !dark;
    dropSet();
    return;
  }

  if (event.keyCode == 81) {
    workers *= 2;
    updateInformation();
    dropSet();
    return;
  }
  if (event.keyCode == 65) {
    if (workers > 1) {
      workers /= 2;
      updateInformation();
      dropSet();
    }
    return;
  }
  
  if (event.keyCode == 85) {
    cvs = createCanvas(windowWidth, windowHeight);
    dev1.style.left = windowWidth / 2 - 45 + "px";
    dev1.style.top = windowHeight / 2 - 10 + "px";
    setTimeout(()=>{
      var crd = coords[coords.length-1];
      var delH = (height - h0)/2;
      var delW = (width - w0)/2;
      crd.x0 = crd.x0.minus( new BigNumber(delW).times( (crd.x1.minus(crd.x0)).div(w0)));
      crd.y0 = crd.y0.minus( new BigNumber(delH).times( (crd.y1.minus(crd.y0)).div(h0)));
      crd.x1 = crd.x1.plus( new BigNumber(delW).times( (crd.x1.minus(crd.x0)).div(w0)));
      crd.y1 = crd.y1.plus( new BigNumber(delH).times( (crd.y1.minus(crd.y0)).div(h0)));
      dropSet();
      w0 = width;
      h0 = height;
    }, 300);
    return;
  }
  if (event.keyCode == 87){
    setPrecision(prec++);
  }
  if (event.keyCode == 83){
    if (prec<0) return ;
    setPrecision(prec--);
  }
});

function checkColor() {
  if (!prevColors) prevColors = {};
  prevColors.Hue = Hue;
  prevColors.sat = sat;
  prevColors.Value = Value;
}

function setPrecision(p){
  BigNumber.set({ DECIMAL_PLACES: p });
}

function drawMagnifier(){
  if (magnif) {
      dev4.style.display = 'block';
      dev4.style.width = width/scl  + 'px';
      dev4.style.height = height/scl + 'px';
      dev4.style.left = ( mouseX - 0.5 * width / scl) + "px";
      dev4.style.top = ( mouseY - 0.5 * height / scl)+ "px"; 
      setTimeout(()=>{
        magnif = false;
        dev4.style.display = 'none';
      }, 200);
  }
}

function setup() {
  console.log('Current Resolution: ' + innerWidth + 'x' +  innerHeight);
  cvs = createCanvas(windowWidth, windowHeight);
  BigNumber.set({ DECIMAL_PLACES: prec });	
  h0 = height;
  w0 = width;
  scl = 2;
  w = width / scl;
  h = height / scl;
  iter = 50;
  degrad = 10;
  workers = 16;
  coords.push({ x0: new BigNumber(-3.0), x1: new BigNumber(3.0) });
  var crd = coords[0];
  var xlen = crd.x1.minus(crd.x0);
  var ylen = xlen.times(height).div(width);
  crd.y1 = ylen.times(-1).div(2);
  crd.y0 = ylen.div(2);
  createControls();
  dropSet();
  setTimeout(() => (dev3.style.display = "none"), 10000);
}

function createControls() {
  cvs.elt.setAttribute(
    "onmouseup",
    "if (!busy && !dragged && !midbutton) makeSet();"
  );
  cvs.elt.addEventListener("mousedown", event => {
    if (busy) return;
    if (event.button == 1) {
      midbutton = true;
      if (coords.length > 1) coords.pop();
      if (zoomed>2) zoomed -= scl;
      dropSet();
      setTimeout(() => (midbutton = false), 500);
    }
  });
  cvs.elt.addEventListener("mouseup", e => {
    oldMouseX = null;
    oldMouseY = null;
  });

  cvs.elt.addEventListener("mousemove", event => {
    if (busy) return;
    var x = mouseX;
    var y = mouseY;
    xM = x;
    yM = y;
    ax = x - width / scl / 2;
    ay = y - height / scl / 2;
    drawMagnifier();
    
    var currentX = mapFloat(
      x,
      0,
      width,
      coords[coords.length - 1].x0,
      coords[coords.length - 1].x1
    );
    var currentY = mapFloat(
      y,
      0,
      height,
      coords[coords.length - 1].y0,
      coords[coords.length - 1].y1
    );
    updateInformation(currentX.toString(), currentY.toString());

    if (mouseIsPressed && dragged) {
      var crd = coords[coords.length - 1];
      if (oldMouseX && oldMouseY) {
        var xRem = mapFloat(oldMouseX - mouseX, 0, width, 0, crd.x1.minus(crd.x0));
        var yRem = mapFloat(oldMouseY - mouseY, 0, height, 0, crd.y1.minus(crd.y0));
        var xstt = crd.x0.plus(xRem);
        var ystt = crd.y0.plus(yRem);
        var xend = crd.x1.plus(xRem);
        var yend = crd.y1.plus(yRem);
        oldMouseX = mouseX;
        oldMouseY = mouseY;
        coords.push({ x0: xstt, y0: ystt, x1: xend, y1: yend });
        dropSet(true);
        coords[coords.length - 2] = coords[coords.length - 1];
        coords.pop();
      } else {
        oldMouseX = mouseX;
        oldMouseY = mouseY;
      }
    }
  });

  dev0 = document.createElement("div");
  dev0.style.position = "absolute";
  dev0.style.padding = "0px";
  dev0.style.margin = "0px";
  dev0.style.left = "8px";
  dev0.style.top = "8px";

  for (var i = 0; i < 20; i++) {
    var p = document.createElement("p");
    dev0.appendChild(p);
  }

  dev3 = document.createElement("div");
  dev3.style.position = "absolute";
  dev3.style.padding = "0px";
  dev3.style.margin = "0px";
  dev3.style.right = "8px";
  dev3.style.top = "8px";
  dev3.style.display = "block";

  for (var i = 0; i < 20; i++) {
    var p = document.createElement("p");
    dev3.appendChild(p);
  }

  dev1 = document.createElement("div");
  dev1.style.background = "#fff";
  dev1.style.position = "absolute";
  dev1.style.padding = "3px";
  dev1.style.margin = "0px";
  dev1.style.left = innerWidth / 2 - 45 + "px";
  dev1.style.top = innerHeight / 2 - 10 + "px";
  dev1.style.display = "none";
  dev1.innerHTML = "Calculation..";
  
  dev4 = document.createElement("div");
  dev4.style.background = "rgba(125, 125, 125, 0.1)";
  dev4.style.position = "absolute";
  dev4.style.margin = "0px";
  dev4.style.display = "none";
  dev4.style.border = '1px solid #888';

  dev3.children[1].innerHTML = "<p>press <b>o</b>/<b>l</b> to change resolution</p>";
  dev3.children[2].innerHTML = "<p>press <b>k</b>/<b>i</b> to change iterations</p>";
  dev3.children[7].innerHTML = "<p>hold <b>ctrl</b> to drag</p>";
  dev3.children[3].innerHTML = "<p>press <b>c</b>/<b>v</b> to change magnification</p>";
  dev3.children[4].innerHTML = "<p>press <b>d</b> to save in .jpg</p>";
  dev3.children[5].innerHTML = "<p>press <b>g</b>, <b>h</b>, <b>j</b> to change saturation, delta hue, value</p>";
  dev3.children[0].innerHTML = "<p>press <b>e</b> to close/open help div</p>";
  dev3.children[8].innerHTML = "<p>press <b>mid mouse button</b> to go one step back</p>";
  dev3.children[10].innerHTML = "<p>press <b>1</b> to enter black&white mode</p>";
  dev3.children[11].innerHTML = "<p>press <b>2</b> to enter dark mode</p>";
  dev3.children[12].innerHTML = "<p>press <b>q</b>/<b>a</b> to change the number of workers</p>";
  dev3.children[13].innerHTML = "<p>press <b>x</b> to kill current job</p>";
  dev3.children[14].innerHTML = '<p>press <b>u</b> to update image</p>';
  dev3.children[15].innerHTML = '<p>press <b>w</b>/<b>s</b> to change precision</p>';

  this.document.body.appendChild(dev0);
  this.document.body.appendChild(dev1);
  this.document.body.appendChild(dev3);
  this.document.body.appendChild(dev4);
}

function makeSet() {
  zoomed += scl;
  var crd = coords[coords.length - 1];
  var xstt = crd.x0;
  var xend = crd.x1;
  var ystt = crd.y0;
  var h = new BigNumber(height).div(scl),
      w = new BigNumber(width).div(scl);
  var xlen = crd.x1.minus(crd.x0);
  var ylen = xlen.times(h).div(w);
  var yend = ystt.minus(ylen);
  crd.y1 = yend;
  
  xstt = mapFloat(ax, 0, width, crd.x0, crd.x1);
  ystt = mapFloat(ay, 0, height, crd.y0, crd.y1);
  xend = mapFloat(new BigNumber(ax).plus(w), 0, width, crd.x0, crd.x1);
  yend = mapFloat(new BigNumber(ay).plus(h), 0, height, crd.y0, crd.y1);
  
  //if (Math.abs((xend - xstt)/(ystt - yend) - width/height) > 0.2) alert('resolution error!');
  coords.push({ x0: xstt, y0: ystt, x1: xend, y1: yend });

  dropSet();
}

function dropSet() {
  getPoints(
    iter,
    coords[coords.length - 1].x0,
    coords[coords.length - 1].y0,
    coords[coords.length - 1].x1,
    coords[coords.length - 1].y1
  );
}

function updateInformation(currentX, currentY) {
  if (dev0) {
    if (!currentX) currentX = 0;
    if (!currentY) currentY = 0;
    dev0.children[0].innerHTML = "<p>x: " + currentX + "</p>";
    dev0.children[1].innerHTML = "<p>y: " + currentY + "</p>";
    dev0.children[2].innerHTML =
      "<p>Resolution: " +
      Math.round(width / degrad) +
      "x" +
      Math.round(height / degrad) +
      "</p>";
    dev0.children[3].innerHTML = "<p>Iterations: " + iter + "</p>";
    dev0.children[4].innerHTML = "<p>Magnifier: " + scl + "</p>";
    dev0.children[5].innerHTML = "<p>Zoomed in: " + zoomed + "</p>";
    dev0.children[6].innerHTML = "<p>Saturation: " + sat + "</p>";
    dev0.children[7].innerHTML = "<p>Delta Hue: " + Hue + "</p>";
    dev0.children[8].innerHTML = "<p>Value: " + Value + "</p>";
    dev0.children[9].innerHTML = "<p>Workers: " + workers + "</p>";
  }
}

//async drawing :DDD
function getPoints(it, xstt, ystt, xend, yend) {
  colorMode(RGB, 255);
  if (bw) {
    if (!dark) background(0);
    else background(255);
  } else {
    background(125);
  }
  busy = true;
  show();
  done = 0;
  var wi = width / degrad;
  var he = height / degrad;
  proc = [];
  for (let i = 0; i < he; i++) {
    var a2 = mapFloat(i, 0, he, ystt, yend);
    var a4 = mapFloat(i + 1, 0, he, ystt, yend);
    var yprio = Math.abs(i - he/2);
    for (let j = 0; j < workers; j++) {
      var x0 = mapFloat(j, 0, workers, 0, wi);
      var x1 = mapFloat(j+1, 0, workers, 0, wi);
      var a1 = mapFloat(j, 0, workers, xstt, xend);
      var a3 = mapFloat(j + 1, 0, workers, xstt, xend);
      var xprio = Math.abs(j - workers/2)*he/workers;
      var prio = Math.sqrt(Math.pow(xprio, 2) + Math.pow(yprio, 2)).toFixed(1);
      proc.push({prio: prio, x0: x0, y0: i, x1: x1, y1: i + 1, it: it, a1: a1, a2: a2, a3: a3, a4: a4});
    }
  }
  proc = proc.sort((a,b)=>{
    return a.prio - b.prio;
  });
  for (let i = 0; i<proc.length; i++){
    let {x0, y0, x1, y1, it, a1, a2, a3, a4} = proc[i];
    stuff(x0, y0, x1, y1, it, a1, a2, a3, a4);
  }
}

function stuff(x0, y0, x1, y1, it, xstt, ystt, xend, yend) {
  setTimeout(() => {
    if (stop) {
      done++;
      if (done == proc.length) {
        busy = false;
        unshow();
        stop = false;
	proc = null;
      }
      return;
    }
    x0 = parseInt(x0);
    y0 = parseInt(y0);
    x1 = parseInt(x1);
    y1 = parseInt(y1);
    for (var x = x0; x < x1; x++) {
      for (var y = y0; y < y1; y++) {
        var z = new Complex(new BigNumber(0.0), new BigNumber(0.0));
	var i = mapFloat(x, x0, x1, xstt, xend);
        var j = mapFloat(y, y0, y1, ystt, yend);
	var c = new Complex(i, j);
	for (var k = 0; k < it; k++) {
	  z = z.square();
          z = z.add(c);
          if ( z.getR().isGreaterThan(2) ) {
            if (bw) {
              colorMode(RGB, 255);
              var gradient = (k / it) * 255;
              if (dark) fill(gradient);
              else fill(255 - gradient);
              noStroke();
              rect(x * degrad, y * degrad, degrad, degrad);
              break;
            } else {
              colorMode(HSB, 255);
              var hue = (k / it) * Hue;
              fill(hue, sat, Value);
              noStroke();
              rect(x * degrad, y * degrad, degrad, degrad);
              break;
            }
          }
        }
      }
    }
    done++;
    if (done == proc.length) {
      unshow();
      busy = false;
      proc = null;
    }
  }, 0);
}

function mapFloat(a, b, c, d, e){
  var s0 = new BigNumber(b);
  var e0 = new BigNumber(c);
  var s1 = new BigNumber(d);
  var e1 = new BigNumber(e);
  var v = new BigNumber(a);
  //return new BigNumber( new BigNumber(v.minus(s0).toFixed(prec)).div( new BigNumber(e0.minus(s0).toFixed(prec))).times( new BigNumber(e1.minus(s1).toFixed(prec))).plus(s1).toFixed(prec));
  return new BigNumber(v.minus(s0).div(e0.minus(s0)).times(e1.minus(s1)).plus(s1).toFixed(prec));
}

class Complex {
  constructor(r, i) {
    this.Re = r;
    this.Im = i;
  }
  getRe() {return this.Re;}
  getIm() {return this.Im;}
  getR() {this.updateR();return this.R;}

  add(Complex) {
    this.Re = new BigNumber(this.Re.plus( Complex.getRe() ).toFixed(prec));
    this.Im = new BigNumber(this.Im.plus( Complex.getIm() ).toFixed(prec));
    return this;
  }

  square() {
    let tempIm = this.Im;
    this.Im = new BigNumber(this.Re.times(this.Im).toFixed(prec)).plus( new BigNumber(this.Im.times(this.Re).toFixed(prec)));
    this.Re = new BigNumber(this.Re.pow(2).toFixed(prec)).minus( new BigNumber(tempIm.pow(2).toFixed(prec)));
    return this;
  }

  updateR() {
    //this.R = new BigNumber(this.Re.pow(2).toFixed(prec)).plus( new BigNumber(this.Im.pow(2).toFixed(prec))).sqrt();
    this.R = this.Re.pow(2).plus(this.Im.pow(2)).sqrt();
  }
}
