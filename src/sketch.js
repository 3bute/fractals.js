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
  P = false;

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
  var crd = coords[0];
  var xlen = crd.x1 - crd.x0;
  var ylen = (xlen * height) / width;
  crd.y1 = -ylen / 2;
  crd.y0 = ylen / 2;
  createControls();
  dropSet();
  setTimeout(() => (dev3.style.display = "none"), 20000);
}
