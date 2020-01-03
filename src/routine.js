
function switchP() {
  P = !P;
  if (!prec) prec = 17;
  if (P) setupP(); 
  else{
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
}
function setPrecision(p){
  BigNumber.set({ DECIMAL_PLACES: p });
}
function stopCalc() {
  stop = true;
}
function makeSet() {
  zoomed += scl;
  var crd = coords[coords.length - 1];
  var xstt = crd.x0;
  var xend = crd.x1;
  var ystt = crd.y0;
  var h = height / scl,
    w = width / scl;
  var xlen = crd.x1 - crd.x0;
  var ylen = (xlen * h) / w;
  var yend = ystt - ylen;
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
  var wi = width / degrad;
  var he = height / degrad;
  proc = [];
  for (let i = 0; i < he; i++) {
    var a2 = map(i, 0, he, ystt, yend);
    var a4 = map(i + 1, 0, he, ystt, yend);
    var yprio = Math.abs(i - he/2);
    for (let j = 0; j < workers; j++) {
      var x0 = Math.round(map(j, 0, workers, 0, width / degrad));
      var x1 = Math.round(map(j + 1, 0, workers, 0, width / degrad));
      var a1 = map(j, 0, workers, xstt, xend);
      var a3 = map(j + 1, 0, workers, xstt, xend);
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
    for (var x = x0; x < x1; x++) {
      for (var y = y0; y < y1; y++) {
        let z = new Complex(0, 0);
        var i = map(x, x0, x1, xstt, xend);
        var j = map(y, y0, y1, ystt, yend);
        let c = new Complex(i, j);
        for (var k = 0; k < it; k++) {
	  z = z.square();
          z = z.add(c);
          if (z.getR() > 2) {
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
  }, 1);
}
