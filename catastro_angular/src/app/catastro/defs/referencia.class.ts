
export class Referencia {
  length: 14 | 20;
  type: 'rustica' | 'urbana';
  ref: string;
  //
  fin?: string;// 7
  hoj?: string;// 7
  inm?: string;// 4
  //
  pro?: string;// 2
  mun?: string;// 3
  sec?: string;// 1
  pol?: string;// 3
  par?: string;// 5

  constructor(ref:string) {
    if (ref.length != 14 && ref.length != 20) {
      throw new Error('Referencia debe tener 14 o 20 carácteres.');
    } else this.length = ref.length;
    if (this.isValidUrbana(ref)) {
      this.type = 'urbana';
    } else if (this.isValidRustica(ref)) {
      this.type ='rustica';
    } else {
      throw new Error('El formato de la referencia es inválido.');
    }
    this.ref = ref;
  }

  isValidUrbana(ref: string) {
    const regexpUrbana =
      /^[0-9]{7}[a-zA-Z0-9]{6}[a-zA-Z]{1}([0-9]{4}[a-zA-Z]{2})?/;
    const ok = ref.match(regexpUrbana) != null;
    if (ok) {
      this.fin = ref.slice(0, 7);
      this.hoj = ref.slice(7, 14);
      if (ref.length === 20) this.inm = ref.slice(14, 18);
    }
    return ok;
  }

  isValidRustica(ref: string) {
    const regexpRustica = /^[0-9]{5}[a-zA-Z]{1}[0-9]{8}([0-9]{4}[a-zA-Z]{2})?/;
    const ok = ref.match(regexpRustica) != null;
    if (ok) {
      this.pro = ref.slice(0, 2);
      this.mun = ref.slice(2, 5);
      this.sec = ref.slice(5, 6);
      this.pol = ref.slice(6, 9);
      this.par = ref.slice(9, 14);
      if (ref.length === 20) this.inm = ref.slice(14, 18);
    }
    return ok;
  }
}


