import { Controller, Get, Param, Query } from '@nestjs/common';
import { AppService } from './app.service';
import { ReferenciaDTO } from './interfaces/referencia.interface';
import { SelectDTO } from './interfaces/select.interface';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('/provincias')
  async provincias(): Promise<SelectDTO[]> {
    return await this.appService.provincias();
  }

  @Get('/municipios')
  async municipios(
    @Query('provincia') provincia : string,
    @Query('search') search : string,
  ): Promise<SelectDTO[]> {
    return await this.appService.municipios(provincia, search);
  }
  
  @Get('/vias')
  async vias(
    @Query('provincia') provincia : string,
    @Query('municipio') municipio : string,
    @Query('search') search : string,
  ): Promise<SelectDTO[]> {
    return await this.appService.vias(provincia, municipio, search);
  }
  
  @Get('/numeros')
  async numeros(
    @Query('provincia') provincia : string,
    @Query('municipio') municipio : string,
    @Query('via') via : string,
    @Query('viaTipo') viaTipo: string,
    @Query('search') search : number,
  ): Promise<SelectDTO[]> {
    return await this.appService.numeros(provincia, municipio, via, viaTipo, search);
  }


  @Get('/inmuebles')
  async inmuebles(
    @Query('provincia') provincia : string,
    @Query('municipio') municipio : string,
    @Query('referencia') referencia : string
  ): Promise<ReferenciaDTO[]> {
    return await this.appService.inmuebles(provincia, municipio, referencia);
  }

  
  @Get('/poligonos')
  async poligonos(
    @Query('provincia') provincia : string,
    @Query('municipio') municipio : string,
    @Query('poligono') poligono : number,
    @Query('parcela') parcela : number,
  ): Promise<ReferenciaDTO[]> {
    return await this.appService.poligonos(provincia, municipio, poligono, parcela);
  }

  
  @Get('/coordenadas')
  async coordenadas(
    @Query('lat') lat : number,
    @Query('lng') lng : number,
  ): Promise<SelectDTO> {
    return await this.appService.parcelaDesdeCoordenadas(lat, lng);
  }
}
