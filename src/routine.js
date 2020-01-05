
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
  degrad,
  dev0,
  dev1,
  dev3,
  dev4,
  coords = [],
  hold = false,
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
  workers = 8,
  busy = false,
  stop = false,
  magnif = false,
  h0 = 0, w0 = 0,
  proc = [],
  prec,
  P = false,
  destination,
  julia = false,
  jPo,
  currentX,
  currentY;

function setup() {
  console.log(innerWidth, innerHeight);
  cvs = createCanvas(windowWidth, windowHeight);
  h0 = height;
  w0 = width;
  scl = 2;
  w = width / scl;
  h = height / scl;
  iter = 100;
  degrad = 10;
  coords.push({ x0: -3, x1: 3 });
  let crd = coords[0];
  let xlen = crd.x1 - crd.x0;
  let ylen = (xlen * height) / width;
  crd.y1 = -ylen / 2;
  crd.y0 = ylen / 2;
  createControls();
  dropSet();
  setTimeout(() => (dev3.style.display = "none"), 20000);
}


function xypoints(x, y) {
  if (!P){
    x = parseFloat(x);
    y = parseFloat(y);
    let crd = coords[coords.length-1];
    let dtcx = x - (crd.x1 + crd.x0)/2,
        dtcy = y - (crd.y0 + crd.y1)/2;
    crd.x0 += dtcx;
    crd.x1 += dtcx;
    crd.y0 += dtcy;
    crd.y1 += dtcy;
    dropSet();
  }else{
    x = BigNumber(x);
    y = BigNumber(y);
    let crd = coords[coords.length-1];
    let dtcx = x.minus(crd.x1.plus(crd.x0).div(2)),
        dtcy = y.minus(crd.y0.plus(crd.y1).div(2));
    crd.x0 = crd.x0.plus(dtcx).toFixed(prec);
    crd.x1 = crd.x1.plus(dtcx).toFixed(prec);
    crd.y0 = crd.y0.plus(dtcy).toFixed(prec);
    crd.y1 = crd.y1.plus(dtcy).toFixed(prec);
    dropSetP();
  }
  destination = {};
  destination.x = x;
  destination.y = y;
}

function zoom(i) {
  let crd = coords[coords.length -1],
      ctr;
  if (destination) ctr = destination;
  if (!P) {
    if (!ctr) {
      ctr = {};
      ctr.x = (crd.x0 + crd.x1)/2;
      ctr.y = (crd.y0 + crd.y1)/2;
    }
    ctr.xd = (crd.x1 - crd.x0)/i;
    ctr.yd = (crd.y0 - crd.y1)/i;
    crd.x0 = ctr.x - ctr.xd;
    crd.x1 = ctr.x + ctr.xd;
    crd.y0 = ctr.y + ctr.yd;
    crd.y1 = ctr.y - ctr.yd;
    dropSet();
  }else{
    if (!ctr) {
      ctr = {};
      ctr.x = crd.x0.plus(crd.x1).div(2.0);
      ctr.y = crd.y0.plus(crd.y1).div(2.0);
    }
    ctr.xd = crd.x1.minus(crd.x0).div(i);
    ctr.yd = crd.y0.minus(crd.y1).div(i);
    crd.x0 = ctr.x.minus(ctr.xd);
    crd.x1 = ctr.x.plus(ctr.xd);
    crd.y0 = ctr.y.plus(ctr.yd);
    crd.y1 = ctr.y.minus(ctr.yd);
    dropSetP();
  }
}

function switchP() {
  if (!P) {
    degrad = 30;
    workers = 64;
    if (!prec) prec = 17;
    setupP();
  }else{
    degrad = 10;
    workers = 8;
    let crd = coords[coords.length-1];
    coords.push({ 
      x0: Number(crd.x0.toFixed(16)),
      x1: Number(crd.x1.toFixed(16)),
      y0: Number(crd.y0.toFixed(16)),
      y1: Number(crd.y1.toFixed(16))
    });
    createControls();
    dropSet();
  }
  P = !P;
}
function setPrecision(p){BigNumber.set({DECIMAL_PLACES:p})}
function stopCalc(){stop = true}
function makeSet() {
  if (julia&&!jPo) {
    jPo = {};
    jPo.x = currentX;
    jPo.y = currentY;
    dropSet();
    return ;
  }
  zoomed += scl;
  let crd = coords[coords.length - 1];
  let xstt = crd.x0;
  let xend = crd.x1;
  let ystt = crd.y0;
  let h = height / scl,
      w = width / scl;
  let xlen = crd.x1 - crd.x0;
  let ylen = (xlen * h) / w;
  let yend = ystt - ylen;
  crd.y1 = yend;
  xstt = map(ax, 0, width, crd.x0, crd.x1);
  ystt = map(ay, 0, height, crd.y0, crd.y1);
  xend = map(ax + w, 0, width, crd.x0, crd.x1);
  yend = map(ay + h, 0, height, crd.y0, crd.y1);
  if (Math.abs((xend - xstt)/(ystt - yend) - width/height) > 0.01) {
    switchP();    
    alert('switched to high precision, the speed will drop significantly :\(');
    return ;
  }
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
  let wi = width / degrad;
  let he = height / degrad;
  proc = [];
  for (let i = 0; i < he; i++) {
    let a2 = map(i, 0, he, ystt, yend);
    let a4 = map(i + 1, 0, he, ystt, yend);
    let yprio = Math.abs(i - he/2);
    for (let j = 0; j < workers; j++) {
      let x0 = Math.round(map(j, 0, workers, 0, width / degrad));
      let x1 = Math.round(map(j + 1, 0, workers, 0, width / degrad));
      let a1 = map(j, 0, workers, xstt, xend);
      let a3 = map(j + 1, 0, workers, xstt, xend);
      let xprio = Math.abs(j - workers/2)*he/workers;
      let prio = Math.sqrt(Math.pow(xprio, 2) + Math.pow(yprio, 2)).toFixed(1);
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
    if (P) {
      x0 = parseInt(x0);
      y0 = parseInt(y0);
      x1 = parseInt(x1);
      y1 = parseInt(y1);
    }
    for (let x = x0; x < x1; x++) {
      for (let y = y0; y < y1; y++) {
        let z;
        if (jPo) {
          z = (P) ? new ComplexP(new BigNumber(jPo.x),
                    new BigNumber(jPo.y))
                  :
                    new Complex(jPo.x, jPo.y);
        }else{
          z = (P) ?
            new ComplexP(new BigNumber(0.0),
                        new BigNumber(0.0))
          :
            new Complex(0, 0)
        }
        let i = (P) ? mapFloat(x, x0, x1, xstt, xend)
                    : map(x, x0, x1, xstt, xend);
        let j = (P) ? mapFloat(y, y0, y1, ystt, yend)
                    : map(y, y0, y1, ystt, yend);
        let c = (P) ? new ComplexP(i, j) : new Complex(i, j);
        if (jPo) {
          let tmp = c;
          c = z;
          z = tmp;
        }
        for (let k = 0; k < it; k++) {
	        z = z.square();
          z = z.add(c);
          if (drawRect(k/it, z.getR(), 2, x, y)) break;
        }
      }
    }
    done++;
    if (done == proc.length) {
      unshow();
      busy = false;
      proc = null;
    }
  }, 1);
}

function drawRect(delta, val, bound, x, y){
  let check = (P) ? (val.isGreaterThan(bound)) : (val > bound); 
  if (check) {
    if (bw) {
      colorMode(RGB, 255);
      let gradient = delta * 255;
      if (dark) fill(gradient);
      else fill(255 - gradient);
    } else {
      colorMode(HSB, 255);
      let hue = delta * Hue;
      fill(hue, sat, Value);
    }
    noStroke();
    rect(x * degrad, y * degrad, degrad, degrad);
    return true;
  }
  return false;
}



function setupP() {
  BigNumber.set({ DECIMAL_PLACES: prec });	
  let crd = coords[coords.length-1];
  coords.push({ x0: new BigNumber(crd.x0),
	              x1: new BigNumber(crd.x1),
                y0: new BigNumber(crd.y0),
  		          y1: new BigNumber(crd.y1)});
  createControlsP();
  dropSetP();
}

function makeSetP() {
  if (julia&&!jPo) {
    jPo = {};
    jPo.x = currentX;
    jPo.y = currentY;
    dropSetP();
    return ;
  }
  zoomed += scl;
  let crd = coords[coords.length - 1];
  crd.x0 = new BigNumber(crd.x0);
  crd.x1 = new BigNumber(crd.x1);
  crd.y0 = new BigNumber(crd.y0);
  crd.y1 = new BigNumber(crd.y1);
  let xstt = crd.x0;
  let xend = crd.x1;
  let ystt = crd.y0;
  let h = new BigNumber(height).div(scl),
      w = new BigNumber(width).div(scl);
  let xlen = crd.x1.minus(crd.x0);
  let ylen = xlen.times(h).div(w);
  let yend = ystt.minus(ylen);
  crd.y1 = yend;
  xstt = mapFloat(ax, 0, width, crd.x0, crd.x1);
  ystt = mapFloat(ay, 0, height, crd.y0, crd.y1);
  xend = mapFloat(new BigNumber(ax).plus(w), 0, width, crd.x0, crd.x1);
  yend = mapFloat(new BigNumber(ay).plus(h), 0, height, crd.y0, crd.y1);
  let delta =  xend.minus(xstt).div(ystt.minus(yend)).minus(width/height).toFixed(4);
  if (Math.abs(Number(delta))>0.001 ) {
    prec+=2;
    setPrecision(prec);
  }
  coords.push({ x0: xstt, y0: ystt, x1: xend, y1: yend });
  dropSetP();
}

function dropSetP() {
  let crd = coords[coords.length-1];
  getPointsP(
    iter,
    new BigNumber(crd.x0),
    new BigNumber(crd.y0),
    new BigNumber(crd.x1),
    new BigNumber(crd.y1)
  );
}

function getPointsP(it, xstt, ystt, xend, yend) {
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
  let wi = width / degrad;
  let he = height / degrad;
  proc = [];
  for (let i = 0; i < he; i++) {
    let a2 = mapFloat(i, 0, he, ystt, yend);
    let a4 = mapFloat(i + 1, 0, he, ystt, yend);
    let yprio = Math.abs(i - he/2);
    for (let j = 0; j < workers; j++) {
      let x0 = mapFloat(j, 0, workers, 0, wi);
      let x1 = mapFloat(j+1, 0, workers, 0, wi);
      let a1 = mapFloat(j, 0, workers, xstt, xend);
      let a3 = mapFloat(j + 1, 0, workers, xstt, xend);
      let xprio = Math.abs(j - workers/2)*he/workers;
      let prio = Math.sqrt(Math.pow(xprio, 2) + Math.pow(yprio, 2)).toFixed(1);
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

function mapFloat(a, b, c, d, e){
  let s0 = new BigNumber(b);
  let e0 = new BigNumber(c);
  let s1 = new BigNumber(d);
  let e1 = new BigNumber(e);
  let v = new BigNumber(a);
  //return new BigNumber( new BigNumber(v.minus(s0).toFixed(prec)).div( new BigNumber(e0.minus(s0).toFixed(prec))).times( new BigNumber(e1.minus(s1).toFixed(prec))).plus(s1).toFixed(prec));
  return new BigNumber(v.minus(s0).div(e0.minus(s0)).times(e1.minus(s1)).plus(s1).toFixed(prec));
}

