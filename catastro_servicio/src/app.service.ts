import { Injectable } from '@nestjs/common';
import { SelectDTO } from './interfaces/select.interface';
import * as xml2js from 'xml2js'
import { Referencia } from './classes/referencia.class';
import { ReferenciaDTO } from './interfaces/referencia.interface';
import { HttpService } from '@nestjs/axios';
import { catchError, firstValueFrom, lastValueFrom } from 'rxjs';
import { AxiosError } from 'axios';

@Injectable()
export class AppService {
  
  host = 'http://ovc.catastro.meh.es'
  host_callejero = this.host + '/ovcservweb/OVCSWLocalizacionRC/OVCCallejero.asmx'
  host_coordenadas = this.host + '/ovcservweb/OVCSWLocalizacionRC/OVCCoordenadas.asmx'
  host_wms = this.host + '/Cartografia/WMS/ServidorWMS.aspx'
  new_host_ref = 'http://www.catastro.meh.es/ws/esquemas/consulta_dnp.xsd'

  constructor(private http: HttpService) {}

  async getValidateAndParse(url: string){
    console.log(url);
    
    try{var raw = await firstValueFrom( this.http.get(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:109.0) Gecko/20100101 Firefox/114.0",
      },
    }))
    }catch(e){ 
      throw new Error('502: Error de conexión al servicio de catastro online.')
    }
    try{var parsed = await xml2js.parseStringPromise(raw.data)
    }catch(e){  throw new Error('502: Error en respuesta de catastro online.')}

    const error = Number(parsed[Object.keys(parsed)[0]].control[0].cuerr?? 0)
    const results = Number(parsed[Object.keys(parsed)[0]].control[0].cunum?? 0)
    if(error && !results) throw new Error('502: Parametros introducidos erroneos.')

    const inmueblesLength = parsed[Object.keys(parsed)[0]].control[0].cudnp
    if(inmueblesLength===0) throw new Error('502: No hay resultados.')

    return parsed[Object.keys(parsed)[0]]

  }


  // @ Obtener listado de provincias.
  async provincias(): Promise<SelectDTO[]> {
    const url = `${this.host_callejero}/ConsultaProvincia`;
    const parsed = await this.getValidateAndParse(url)
    return parsed.provinciero[0].prov.map((prov:any)=> ({value: prov.cpine[0], label: prov.np[0]  }))
  }

  // @ Obtener listado de municipios de una provincia.
  async municipios(prov_label : SelectDTO["label"], search: string = '') : Promise<SelectDTO[]> {
    const url = `${this.host_callejero}/ConsultaMunicipio?Provincia=${encodeURI(prov_label)}&Municipio=${encodeURI(search)}`;
    const parsed = await this.getValidateAndParse(url)
    return parsed.municipiero[0].muni.map((m:any)=>({
      label: m.nm[0], 
      value: m.locat[0].cmc[0]
    }))
  }

  // @ Obtener vias de una municipio.
  async vias(prov_label : SelectDTO["label"], muni_label : SelectDTO["label"], search: string = '') : Promise<SelectDTO[]> {
    const url = `${this.host_callejero}/ConsultaVia?Provincia=${encodeURI(prov_label)}&Municipio=${encodeURI(muni_label)}&TipoVia=&NombreVia=${search}`;
    const parsed = await this.getValidateAndParse(url)
    return parsed.callejero[0].calle.map((m:any)=>({
      label: m.dir[0].nv[0], 
      value: m.dir[0].cv[0],
      via_tipo: m.dir[0].tv[0]
    }))
  }

  // @ Obtener numeros cercanos de una via (+-5(10resultados)).
  async numeros(prov_label : SelectDTO["label"], muni_label : SelectDTO["label"], via_label: SelectDTO['label'], via_tipo: string, numero: number = 0) : Promise<SelectDTO[]> {
    const url = `${this.host_callejero}/ConsultaNumero?Provincia=${encodeURI(prov_label)}&Municipio=${encodeURI(muni_label)}&TipoVia=${via_tipo}&NomVia=${encodeURI(via_label)}&Numero=${numero}`;
    const parsed = await this.getValidateAndParse(url)
    
    return parsed.numerero[0].nump.map((m:any)=>({
      label: m.num[0].pnp[0], 
      value: m.pc[0].pc1[0] + m.pc[0].pc2[0]
    }))
  }

  // @ Con una referencia de parcela, obtener listado de referencias de inmueble.
  async inmuebles(prov_label : SelectDTO["label"], muni_label : SelectDTO["label"], ref: SelectDTO['value']) : Promise<ReferenciaDTO[]> {
    const referencia = new Referencia(ref)
    const url = `${this.host_callejero}/Consulta_DNPRC?Provincia=${encodeURI(prov_label)}&Municipio=${encodeURI(muni_label)}&RC=${encodeURI(referencia.ref)}`;
    const parsed = await this.getValidateAndParse(url)


    const inmueblesLength = parsed.control[0].cudnp
    if(referencia.type === 'urbana'){
      if(inmueblesLength == 1){
        

        const path_ref = parsed.bico[0].bi[0].idbi[0].rc[0]
        if(parsed.bico[0].bi[0].dt[0]?.locs[0]?.lous)
          var base_path = parsed.bico[0].bi[0].dt[0]?.locs[0]?.lous[0]
        else if(parsed.bico[0].bi[0].dt[0]?.locs[0]?.lors)
          var base_path = parsed.bico[0].bi[0].dt[0]?.locs[0]?.lors[0]

        const coords = await this.coordenadasDesdeParcela(prov_label, muni_label, path_ref.pc1[0] + path_ref.pc2[0] +path_ref.car[0] + path_ref.cc1[0] + path_ref.cc2[0])

    
        const factor = Number(parsed.bico[0]?.bi[0]?.debi[0]?.sfc?.length? parsed.bico[0]?.bi[0]?.debi[0]?.sfc[0] : 0) / 100
        const correccion = Math.max(0.0001 * factor, 0.0003)
        const foto = this.getMapUrl({lat:coords.lat-correccion, lng:coords.lng-correccion},{lat:coords.lat+correccion, lng:coords.lng+correccion}, referencia.ref.slice(0,14))
       
        return [{...coords,
          foto,
          formato: 'urbana',
          provincia: parsed.bico[0].bi[0].dt[0].np[0],
          municipio: parsed.bico[0].bi[0].dt[0].nm[0],
          via: base_path.lourb[0]?.dir[0]?.nv[0],
          numero: Number(base_path.lourb[0]?.dir[0]?.pnp[0]),
          m2_construidos: Number(parsed.bico[0]?.bi[0]?.debi[0]?.sfc?.length? parsed.bico[0]?.bi[0]?.debi[0]?.sfc[0] : 0),
          antiguedad: Number(parsed.bico[0].bi[0].debi[0].ant? parsed.bico[0].bi[0].debi[0].ant[0]: 0),
          uso: parsed.bico[0].bi[0].debi[0].luso[0],
          bloque: base_path.lourb[0]?.loint[0]?.bq?  base_path?.lourb[0]?.loint[0].bq[0]  :  '',
          escalera: base_path?.lourb[0]?.loint[0]?.es?.length?  base_path?.lourb[0]?.loint[0]?.es[0] : '',
          planta: Number(base_path?.lourb[0]?.loint[0]?.pt[0]),
          puerta: Number(base_path?.lourb[0]?.loint[0]?.pu[0]),
          referencia: path_ref.pc1[0] + path_ref.pc2[0] +path_ref.car[0] + path_ref.cc1[0] + path_ref.cc2[0],
          pdf_url: this.getPdfUrl(prov_label, muni_label, path_ref.pc1[0] + path_ref.pc2[0] +path_ref.car[0] + path_ref.cc1[0] + path_ref.cc2[0])
        }]
      }else if(inmueblesLength>1) {
        return parsed.lrcdnp[0].rcdnp.map((m:any) : ReferenciaDTO=>{
          return {
            formato: 'urbana',
            provincia: m.dt[0]?.np[0],
            municipio: m.dt[0]?.nm[0],
            via: m.dt[0]?.locs[0]?.lous[0]?.lourb[0]?.dir[0]?.nv[0],
            numero: m.dt[0]?.locs[0]?.lous[0]?.lourb[0]?.dir[0]?.pnp[0],
          //m2_construidos: Number(),
          //antiguedad: Number(),
          //uso: ,
            bloque: m.dt[0]?.locs[0]?.lous[0]?.lourb[0]?.loint[0]?.bq? m.dt[0]?.locs[0]?.lous[0]?.lourb[0]?.loint[0].bq[0] : '',
            escalera: m.dt[0]?.locs[0]?.lous[0]?.lourb[0]?.loint[0]?.es?.length? m.dt[0]?.locs[0]?.lous[0]?.lourb[0]?.loint[0]?.es[0] : '',
            planta: m.dt[0]?.locs[0]?.lous[0]?.lourb[0]?.loint[0]?.pt[0],
            puerta: m.dt[0]?.locs[0]?.lous[0]?.lourb[0]?.loint[0]?.pu?.length? m.dt[0]?.locs[0]?.lous[0]?.lourb[0]?.loint[0]?.pu[0]: null,
            referencia: m.rc[0]?.pc1[0] + m.rc[0]?.pc2[0] + m.rc[0]?.car[0] + m.rc[0]?.cc1[0] + m.rc[0]?.cc2[0],
            pdf_url: this.getPdfUrl(prov_label, muni_label,  m.rc[0]?.pc1[0] + m.rc[0]?.pc2[0] + m.rc[0]?.car[0] + m.rc[0]?.cc1[0] + m.rc[0]?.cc2[0])
          }
        })
      }
    }
    if(referencia.type === 'rustica'){
      if(inmueblesLength == 1){
        return [await this.referenceDtoFromOneRustica(parsed)]
      }else if(inmueblesLength>1) {
        return []
      }
    }
    return []
  }

  // @ Con provincia, municipio, pol y par obtiene referencia catastral completa.
  async poligonos(prov_label : SelectDTO["label"], muni_label : SelectDTO["label"], poligono: number, parcela: number) : Promise<ReferenciaDTO[]> {
    const url = `${this.host_callejero}/Consulta_DNPPP?Provincia=${encodeURI(prov_label)}&Municipio=${encodeURI(muni_label)}&Poligono=${poligono}&Parcela=${parcela}`;
    const parsed = await this.getValidateAndParse(url)
    
    return [await this.referenceDtoFromOneRustica(parsed)]
  }


  async referenceDtoFromOneRustica(parsed:any) : Promise<ReferenciaDTO> {
    const path_ref = parsed.bico[0].bi[0].idbi[0].rc[0]
    const referencia = path_ref.pc1[0] + path_ref.pc2[0] +path_ref.car[0] + path_ref.cc1[0] + path_ref.cc2[0]
    const coords = await this.coordenadasDesdeParcela(
      parsed.bico[0].bi[0].dt[0].np[0], 
      parsed.bico[0].bi[0].dt[0].nm[0], 
      referencia
    )

    
    const factor = Number(parsed.bico[0].lspr[0].spr[0].dspr[0].ssp[0]) / 4000
    const correccion = Math.max(0.0003 * factor, 0.0007)
    const foto = this.getMapUrl({lat:coords.lat-correccion, lng:coords.lng-correccion},{lat:coords.lat+correccion, lng:coords.lng+correccion}, referencia.slice(0,14))
   

    return {...coords,
      foto,
      formato: 'rustica',
      provincia: parsed.bico[0].bi[0].dt[0].np[0],
      municipio: parsed.bico[0].bi[0].dt[0].nm[0],
      paraje: parsed.bico[0].bi[0].dt[0]?.locs[0]?.lors[0]?.lorus[0].npa[0],
      m2_construidos: Number(parsed.bico[0].bi[0].debi[0].sfc[0]),
      m2_parcela: Number(parsed.bico[0].lspr[0].spr[0].dspr[0].ssp[0]),
      uso: parsed.bico[0].bi[0].debi[0].luso[0],
      poligono: Number(parsed.bico[0].bi[0].dt[0]?.locs[0]?.lors[0]?.lorus[0].cpp[0].cpo[0]),
      parcela: Number(parsed.bico[0].bi[0].dt[0]?.locs[0]?.lors[0]?.lorus[0].cpp[0].cpa[0]),
      referencia,
      pdf_url: this.getPdfUrl(parsed.bico[0].bi[0].dt[0].np[0], parsed.bico[0].bi[0].dt[0].nm[0], path_ref.pc1[0] + path_ref.pc2[0] +path_ref.car[0] + path_ref.cc1[0] + path_ref.cc2[0])
    }
  }

  // @ Con una referencia de parcela, obtener enlace de descarga de la ficha descriptiva y gráfica.
  getPdfUrl(prov_label : SelectDTO["label"], muni_label : SelectDTO["label"], ref: SelectDTO['value']): string {
    const referencia = new Referencia(ref)
    if(referencia.length != 20) return ''
    return `http://www1.sedecatastro.gob.es/CYCBienInmueble/SECImprimirCroquisYDatos.aspx?del=${encodeURI(prov_label)}&mun=${encodeURI(muni_label)}&refcat=${ref}`
  }


  /// GEO
  // @ Con unas coordenadas obtener la referencia de parcela.
  async parcelaDesdeCoordenadas(lat : number, lng: number, srs : string = 'EPSG:4326') : Promise<SelectDTO> {
    const url = `${this.host_coordenadas}/Consulta_RCCOOR?SRS=${encodeURI(srs)}&Coordenada_X=${lng}&Coordenada_Y=${lat}`;
    const parsed = await this.getValidateAndParse(url)
    return {
      label: parsed.coordenadas[0].coord[0]?.ldt[0],
      value: parsed.coordenadas[0].coord[0]?.pc[0].pc1[0] + parsed.coordenadas[0].coord[0]?.pc[0].pc2[0] 
    }
  }

  // @ Con una referencia de inmueble obtener las coordenadas.
  async coordenadasDesdeParcela(prov_label : SelectDTO["label"], muni_label : SelectDTO["label"], referencia : string, srs : string = 'EPSG:4326') : Promise<any> {
    const url = `${this.host_coordenadas}/Consulta_CPMRC?Provincia=${encodeURI(prov_label)}&Municipio=${encodeURI(muni_label)}&SRS=${encodeURI(srs)}&RC=${referencia.slice(0,14)}`;
    console.log(url);
    
    const parsed = await this.getValidateAndParse(url)
    return {
      lat: Number(parsed.coordenadas[0].coord[0]?.geo[0]?.ycen[0]),
      lng: Number(parsed.coordenadas[0].coord[0]?.geo[0]?.xcen[0]),
    } 
  }

  // @ Definifos unos limites de mapa, obtener el enlace de descarga de la imagen en catastro.
  getMapUrl( sw: {lat:number, lng:number},  ne: {lat:number, lng:number}, ref:string = '', width: number =600, height: number=600, srs:string = 'EPSG:4326',) {
    const refcat = ref != ''? '&refcat='+ref : ''
    return `${this.host_wms}?SERVICE=WMS&SRS=${srs}&REQUEST=GETMAP&bbox=${sw.lng},${sw.lat},${ne.lng},${ne.lat}&width=${width}&height=${height}&format=PNG&transparent=Yes&layers=catastro${refcat}`
  }

}

