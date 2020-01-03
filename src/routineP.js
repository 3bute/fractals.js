
function setupP() {
  BigNumber.set({ DECIMAL_PLACES: prec });	
  var crd = coords[coords.length-1];
  coords.push({ x0: new BigNumber(crd.x0),
	        x1: new BigNumber(crd.x1),
                y0: new BigNumber(crd.y0),
  		y1: new BigNumber(crd.y1)});
  createControlsP();
  dropSetP();
  setTimeout(() => (dev3.style.display = "none"), 10000);
}

function makeSetP() {
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
  var delta =  xend.minus(xstt).div(ystt.minus(yend)).minus(width/height).toFixed(4);
  if (Math.abs(Number(delta))>0.001 ) {
    prec+=2;
    setPrecision(prec);
  }
  coords.push({ x0: xstt, y0: ystt, x1: xend, y1: yend });
  dropSetP();
}

function dropSetP() {
  getPointsP(
    iter,
    coords[coords.length - 1].x0,
    coords[coords.length - 1].y0,
    coords[coords.length - 1].x1,
    coords[coords.length - 1].y1
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
    stuffP(x0, y0, x1, y1, it, a1, a2, a3, a4);
  }
}

function stuffP(x0, y0, x1, y1, it, xstt, ystt, xend, yend) {
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
        var z = new ComplexP(new BigNumber(0.0), new BigNumber(0.0));
	var i = mapFloat(x, x0, x1, xstt, xend);
        var j = mapFloat(y, y0, y1, ystt, yend);
	var c = new ComplexP(i, j);
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

