import { Component } from '@angular/core';
import { ReferenciaDTO } from './catastro/defs/referencia.interface';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: []
})


export class AppComponent {
  title = 'catastro-angular';
  urbana: ReferenciaDTO = {
    "lat": 39.4737249200398,
    "lng": -0.71440346803473,
    "foto": "http://ovc.catastro.meh.es/Cartografia/WMS/ServidorWMS.aspx?SERVICE=WMS&SRS=EPSG:4326&REQUEST=GETMAP&bbox=-0.71470346803473,39.4734249200398,-0.71410346803473,39.4740249200398&width=600&height=600&format=PNG&transparent=Yes&layers=catastro&refcat=6620809XJ9762B",
    "formato": "urbana",
    "provincia": "VALENCIA",
    "municipio": "CHIVA",
    "via": "DOCTOR CORACHAN",
    "numero": 27,
    "m2_construidos": 87,
    "antiguedad": 1971,
    "uso": "Residencial",
    "bloque": "",
    "escalera": "1",
    "planta": 2,
    "puerta": 5,
    "referencia": "6620809XJ9762B0006SP",
    "pdf_url": "http://www1.sedecatastro.gob.es/CYCBienInmueble/SECImprimirCroquisYDatos.aspx?del=VALENCIA&mun=CHIVA&refcat=6620809XJ9762B0006SP"
  }

  cambiaInmueble(e: ReferenciaDTO) {
    console.log('emitimos cambios ', e);
  }
}
