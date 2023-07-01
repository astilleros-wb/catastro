import { catastroService } from './catastro.service';
import {Request, Response, NextFunction} from 'express';

class CatastroController {
  constructor() {}

  async provincias(req: Request, res: Response, next: NextFunction){
    try {
      const data = await catastroService.provincias();
      console.log(data);
      
      if(!data) res.sendStatus(502);
      res.json(data).send()
    } catch (error) {
      console.log(error);
      
      next(error);
    }
  }

  async municipios(req: Request, res: Response, next: NextFunction){
    try {
      const data = await catastroService.municipios(
        String(req.query.provincia), 
        String(req.query.search), 
      );
      if(!data) res.sendStatus(502);
      res.json(data).send()
    } catch (error) {
      next(error);
    }
  }
  
  async vias(req: Request, res: Response, next: NextFunction){
    try {
      const data = await catastroService.vias(
        String(req.query.provincia), 
        String(req.query.municipio), 
        String(req.query.search), 
      );
      if(!data) res.sendStatus(502);
      res.json(data).send()
    } catch (error) {
      next(error);
    }
  }
  
  async numeros(req: Request, res: Response, next: NextFunction){
    try {
      const data = await catastroService.numeros(
        String(req.query.provincia), 
        String(req.query.municipio), 
        String(req.query.via), 
        String(req.query.viaTipo), 
        Number(req.query.search), 
      );
      if(!data) res.sendStatus(502);
      res.json(data).send()
    } catch (error) {
      next(error);
    }
  }


  async inmuebles(req: Request, res: Response, next: NextFunction){
    try {
      const data = await catastroService.inmuebles(
        String(req.query.provincia), 
        String(req.query.municipio), 
        String(req.query.referencia), 
      );
      if(!data) res.sendStatus(502);
      res.json(data).send()
    } catch (error) {
      next(error);
    }
  }

  
  async poligonos(req: Request, res: Response, next: NextFunction){
    try {
      const data = await catastroService.poligonos(
        String(req.query.provincia), 
        String(req.query.municipio), 
        Number(req.query.poligono), 
        Number(req.query.parcela)
        );
        if(!data) res.sendStatus(502);
        res.json(data).send()
    } catch (error) {
      next(error);
    }
  }

  
  async coordenadas(req: Request, res: Response, next: NextFunction){
    try {
      const data = await catastroService.parcelaDesdeCoordenadas(
        Number(req.query.lat), 
        Number(req.query.lng)
      );
      if(!data) res.sendStatus(502);
      res.json(data).send()
    } catch (error) {
      next(error);
    }
  }
}

export const catastroController = new CatastroController()
