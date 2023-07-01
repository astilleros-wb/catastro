import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { InmueblesDialogComponent } from '../dialog/inmuebles-dialog.component';
import { CatastroService } from '../catastro.service';
import { Select } from '../defs/select.interface';
import { Referencia } from '../defs/referencia.class';
import { ReferenciaDTO } from '../defs/referencia.interface';
import { estados } from '../defs/estados.enum';


@Component({
  selector: 'app-catastro',
  templateUrl: './catastro.component.html',
  styleUrls: ['./catastro.component.css'],
})
export class CatastroComponent implements OnInit {

  @Input() inmueble?: any;
  @Input() editable: boolean = true;
  @Output() inmueble_change = new EventEmitter<ReferenciaDTO>();

  constructor(
    private catastro: CatastroService,
    public dialog: MatDialog,
  ) {
  }


  async ngOnInit(): Promise<void> {
    if (this.inmueble) {
      this.actual = estados.inmueble;
    } else {
      this.editable = true;
      this.actual = estados.provincia;
    }

    if (this.editable) {
      this.catastro.provincias().subscribe((provincias: any) => this.provincias = this.provincias_found = provincias);
      this.provinciasControl.valueChanges.subscribe(this.provinciaTextChange);
      this.municipiosControl.valueChanges.subscribe(this.municipioTextChange);
      this.viasControl.valueChanges.subscribe(this.viaTextChange);
      this.numerosControl.valueChanges.subscribe(this.numeroTextChange);
    }
  }


  // PROVINCIAS
  provinciasControl = new FormControl();
  provincias: Select[] = [];
  provincias_found: Select[] = [];
  provincia?: Select;

  provinciaTextChange = (p: string | Select) => {
    if (typeof p !== 'string') return;
    this.provincias_found = this.filterArray(this.provincias, p);

    if (this.provincias_found.length === 0) {
      try {
        const ref = new Referencia(p);

        this.catastro.inmuebles('', '', ref.ref).subscribe((data: any) => {
          this.inmuebles = data;
          this.openDirectDialog();
        });
      } catch (error) {
        //console.log(error);
      }
    }
  };
  provinciaSelectionChange(provincia: Select) {
    this.municipioReset()
    this.provincia = provincia;
    this.catastro.municipios(provincia.label).subscribe((municipios: any[]) => {
      this.municipios_found = this.municipios = municipios;
      this.actual = estados.municipio;
    });
  }


  // MUNICIPIOS
  municipiosControl = new FormControl();
  municipios: Select[] = [];
  municipios_found: Select[] = [];
  municipio?: Select;

  municipioTextChange = (m: string | Select) => {
    if (typeof m !== 'string') return;
    this.municipios_found = this.filterArray(this.municipios, m);
  };

  municipioSelectionChange(municipio: Select) {
    this.tipoReset()
    this.municipio = municipio;
    this.actual = estados.tipo;
  }
  municipioReset() {
    this.municipio = undefined;
    this.municipios = [];
    this.municipios_found = [];
    this.municipiosControl.reset()
  }


  // TIPO
  tipo?: 'rustica' | 'urbana';
  seleccionaRustica() {
    this.rusticaReset()
    this.actual = estados.rustica;
    this.tipo = 'rustica';
  }
  seleccionaUrbana() {
    this.viasReset()
    this.actual = estados.via;
    this.tipo = 'urbana';
  }
  tipoReset() {
    this.tipo = undefined;
  }


  // // Tipo URBANA
  // VIAS
  viasControl = new FormControl();
  vias: any[] = [];
  vias_found: any[] = [];
  via?: any;
  viaTextChange = (v: string | Select) => {
    if (
      !this.provincia ||
      !this.municipio ||
      typeof v !== 'string' ||
      v.length < 2
    ) return;
    this.catastro.vias(this.provincia.label, this.municipio.label, v).subscribe((vias: any[]) => {
      this.vias = vias;
      this.vias_found = this.filterArray(this.vias, v);
    });
  };
  viaSelectionChange(via: Select) {
    this.numerosReset()
    this.via = via;
    this.actual = estados.numero;
  }
  viasReset() {
    this.via = undefined;
    this.vias = [];
    this.viasControl.reset()
    this.vias_found = [];
  }



  // NUMEROS
  numerosControl = new FormControl();
  numeros: Select[] = [];
  numero?: Select;
  pending = 0; // Cantidad de inmuebles por consultar
  numeroTextChange = (n: string | Select) => {
    if (typeof n !== 'string') return;
    if (!this.provincia || !this.municipio || !this.via) return;
    this.catastro.numeros(this.provincia.label, this.municipio.label, this.via.label, this.via.via_tipo, Number(n)).subscribe((numeros: Select[]) => {
      this.numeros = numeros.reduce((acc: Select[], n: Select) => acc.some((a: Select) => a.label === n.label) ? acc : acc.concat(n), []);
    });
  };
  numeroSelectionChange(numero: Select) {
    if (!this.provincia || !this.municipio || !this.via) return;
    this.numero = numero;
    this.inmuebles = [];
    this.catastro.numeros(this.provincia.label, this.municipio.label, this.via.label, this.via.via_tipo, Number(numero.label))
      .subscribe((numeros: Select[]) => {
        this.pending = numeros.length;
        numeros.map((referencia: Select) => {
          if (!this.provincia || !this.municipio) return;
          this.catastro.inmuebles(this.provincia.label, this.municipio.label, referencia.value).subscribe((data: any) => {
            this.pending--;
            this.inmuebles = this.inmuebles.concat(data);
            if (this.pending === 0) {
              this.openNumeroDialog();
            }
          });
        });
      });
  }
  numerosReset() {
    this.numero = undefined;
    this.numeros = [];
    this.numerosControl.reset()
    this.pending = 0;
  }


  // // Tipo RUSTICA
  poligonoControl = new FormControl();
  parcelaControl = new FormControl();
  buscarRustica() {
    if (!this.provincia || !this.municipio || !this.poligonoControl.value || !this.parcelaControl.value) return;
    this.catastro.poligonos(this.provincia.label, this.municipio.label, this.poligonoControl.value, this.parcelaControl.value).subscribe((data: any) => {
      if (!data) return;
      this.inmueble = data[0];
      this.actual = estados.inmueble;
      this.inmueble_change.emit(this.inmueble);
    });
  }
  rusticaReset() {
    this.poligonoControl.reset()
    this.parcelaControl.reset()
  }


  // INMUEBLES
  inmuebles: any[] = [];
  // inmueble:any
  detalle: boolean = false;
  openNumeroDialog(): void {
    if (!this.provincia || !this.municipio) return;
    if (this.inmuebles.length === 1) {
      this.catastro.inmuebles(this.provincia.label, this.municipio.label, this.inmuebles[0].referencia).subscribe((data: any) => {
        this.inmueble = data[0];
        this.actual = estados.inmueble;
        this.inmueble_change.emit(this.inmueble);
      });
    } else {
      const dialogRef = this.dialog.open(InmueblesDialogComponent, {
        width: '500px',
        data: this.inmuebles,
      });

      dialogRef.afterClosed().subscribe((result) => {
        if (!this.provincia || !this.municipio) return;
        this.catastro.inmuebles(this.provincia.label, this.municipio.label, result.referencia).subscribe((data: any) => {
          this.inmueble = data[0];
          this.actual = estados.inmueble;
          this.inmueble_change.emit(this.inmueble);
        });
      });
    }
  }
  editar() {
    this.actual = estados.provincia;
  }

  // REFERNCIA DIRECTA
  openDirectDialog(): void {
    if (this.inmuebles.length === 1) {
      this.inmueble = this.inmuebles[0];
      this.actual = estados.inmueble;
    } else {
      const dialogRef = this.dialog.open(InmueblesDialogComponent, {
        width: '500px',
        data: this.inmuebles,
      });

      dialogRef.afterClosed().subscribe((result) => {
        this.catastro.inmuebles('', '', result.referencia).subscribe((data: any) => {
          this.inmueble = data[0];
          this.actual = estados.inmueble;
        });
      });
    }
  }


  // Estado / Etapa de la busqueda
  estados = estados;
  actual: estados = estados.provincia;
  atras() {
    switch (this.actual) {
      case estados.provincia:
        this.actual = estados.inmueble;
        break;
      case estados.municipio:
        this.actual = estados.provincia;
        break;
      case estados.tipo:
        this.actual = estados.municipio;
        break;
      case estados.via:
        this.actual = estados.tipo;
        break;
      case estados.numero:
        this.actual = estados.via;
        break;
      case estados.rustica:
        this.actual = estados.tipo;
        break;
      case estados.inmueble:
        if (this.tipo == 'rustica') {
          this.actual = estados.rustica;
        } else if (this.tipo == 'urbana') {
          this.actual = estados.numero;
        }
        break;

      default:
        break;
    }
  }

  filterArray(array: Select[], selected: string): Select[] {
    if (!selected) return [];
    const search = selected.toLowerCase();
    const reg = new RegExp(search);
    return array
      .map((data: Select) => ({ data, match: data.label.toLowerCase().match(reg) }))
      .filter((m) => m.match != null)
      .sort((a: any, b: any) => a.match.index - b.match.index)
      .map((val) => val.data);
  }

  displaySelect(select: Select) {
    return select?.label;
  }
}
