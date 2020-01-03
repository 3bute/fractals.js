
class ComplexP {
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
