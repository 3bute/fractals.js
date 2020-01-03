
class Complex {
  constructor(r, i) {
    this.Re = r;
    this.Im = i;
  }

  getRe() {
    return this.Re;
  }
  getIm() {
    return this.Im;
  }
  getR() {
    this.updateR();
    return this.R;
  }

  add(Complex) {
    this.Re += Complex.getRe();
    this.Im += Complex.getIm();
    return this;
  }

  square() {
    let tempIm = this.Im;
    this.Im = this.Re * this.Im + this.Im * this.Re;
    this.Re = this.Re * this.Re - tempIm * tempIm;
    return this;
  }

  updateR() {
    this.R = Math.sqrt(Math.pow(this.Re, 2) + Math.pow(this.Im, 2));
  }
}
