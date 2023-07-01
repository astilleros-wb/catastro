import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CatastroService {
  api = 'http://localhost:3000';
  constructor(private http: HttpClient) { }


  provincias(): Observable<any> {
    const url = `${this.api}/provincias`;
    return this.http.get(url);
  }

  municipios(provincia: string): Observable<any> {
    const url = `${this.api}/municipios?provincia=${provincia}`;
    return this.http.get(url);
  }

  vias(provincia: string, municipio:string, search: string = ''): Observable<any> {
    const url = `${this.api}/vias?provincia=${provincia}&municipio=${municipio}&search=${search}`;
    return this.http.get(url);
  }


  numeros(provincia: string, municipio:string, via:string, via_tipo: string, search: number = 0): Observable<any> {
    const url = `${this.api}/numeros?provincia=${provincia}&municipio=${municipio}&via=${via}&viaTipo=${via_tipo}&search=${search}`;
    return this.http.get(url);
  }

  inmuebles(provincia: string, municipio:string, referencia:string) : Observable<any> {
    const url = `${this.api}/inmuebles?provincia=${provincia}&municipio=${municipio}&referencia=${referencia}`;
    return this.http.get(url);
  }

  poligonos(provincia:string, municipio:string, poligono:number, parcela:number) : Observable<any> {
    const url = `${this.api}/poligonos?provincia=${provincia}&municipio=${municipio}&poligono=${poligono}&parcela=${parcela}`;
    return this.http.get(url);
  }


  coordenadas(lat: number, lng: number): Observable<any> {
    const url = `${this.api}/coordenadas?lat=${lat}&lng=${lng}`;
    return this.http.get(url);
  }
}
