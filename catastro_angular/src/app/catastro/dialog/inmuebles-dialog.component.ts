import {Component, Inject, OnInit} from '@angular/core';
import {FormControl} from '@angular/forms';
import {MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';

@Component({
  selector: 'app-inmuebles-dialog',
  templateUrl: './inmuebles-dialog.component.html',
  styleUrls: ['./inmuebles-dialog.component.css'],
})
export class InmueblesDialogComponent implements OnInit {
  constructor(
    public dialogRef: MatDialogRef<InmueblesDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any[],
  ) {}

  async ngOnInit(): Promise<void> {
    this.inmuebles = this.data;
    this.filterInmuebles();


    // Filtros para listado de inmuebles urbanos.
    this.bloquesControl.valueChanges.subscribe( (bloque:string) => {
      this.bloque = bloque;
      this.filterInmuebles();
    } );
    this.escalerasControl.valueChanges.subscribe((escalera:string) => {
      this.escalera = escalera;
      this.filterInmuebles();
    });
    this.plantasControl.valueChanges.subscribe((planta:string) => {
      this.planta = planta;
      this.filterInmuebles();
    });

    this.puertasControl.valueChanges.subscribe((puerta:string) => {
      this.puerta = puerta;
      this.filterInmuebles();
    });
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  // INMUEBLES
  inmuebles: any[] = [];
  inmuebles_found: any[] = [];

  bloques:string[] = [];
  bloques_found:string[] = [];
  bloque?:string;
  bloquesControl = new FormControl();

  escaleras:string[] = [];
  escaleras_found:string[] = [];
  escalera?:string;
  escalerasControl = new FormControl();

  plantas:string[] = [];
  plantas_found:string[] = [];
  planta?:string;
  plantasControl = new FormControl();

  puertas:string[] = [];
  puertas_found:string[] = [];
  puerta?:string;
  puertasControl = new FormControl();

  clickInmueble(inmueble: any) {
    this.dialogRef.close(inmueble);
  }

  filterInmuebles() {
    this.inmuebles_found = this.inmuebles.filter((i:any)=>
      (!this.bloque || (this.bloque && i.bloque === this.bloque)) &&
      (!this.escalera || (this.escalera && i.escalera === this.escalera)) &&
      (!this.planta || (this.planta && i.planta === this.planta)) &&
      (!this.puerta || (this.puerta && i.puerta === this.puerta)),
    );
    if (this.inmuebles_found.length === 1) {
      this.dialogRef.close(this.inmuebles_found[0]);
    }
    this.bloques_found = this.inmuebles_found.reduce((acc:string[], val: any)=> acc.some((a:string)=>a==val.bloque)? acc : [...acc, val.bloque], []).sort();
    this.escaleras_found = this.inmuebles_found.reduce((acc:string[], val: any)=> acc.some((a:string)=>a==val.escalera)? acc : [...acc, val.escalera], []).sort();
    this.plantas_found = this.inmuebles_found.reduce((acc:string[], val: any)=> acc.some((a:string)=>a==val.planta)? acc : [...acc, val.planta], []).sort();
    this.puertas_found = this.inmuebles_found.reduce((acc:string[], val: any)=> acc.some((a:string)=>a==val.puerta)? acc : [...acc, val.puerta], []).sort();
  }
}
