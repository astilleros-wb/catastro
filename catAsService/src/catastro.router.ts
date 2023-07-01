import { catastroController } from './catastro.controller';
import { Router } from 'express';

const router = Router();

router.get('/provincias', catastroController.provincias);
router.get('/municipios', catastroController.municipios);
router.get('/vias', catastroController.vias);
router.get('/numeros', catastroController.numeros);
router.get('/inmuebles', catastroController.inmuebles);
router.get('/poligonos', catastroController.poligonos);
router.get('/coordenadas', catastroController.coordenadas);

export { router as catastroRouter } 
