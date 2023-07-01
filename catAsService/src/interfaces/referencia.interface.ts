export interface ReferenciaDTO {

    referencia: string,
    formato: 'rustica' | 'urbana',
    provincia: string,
    municipio: string,

    //Urbana
    via?: string,
    numero?: number,
    bloque?: string,
    escalera?: string,
    planta?: number,
    puerta?: number,
    antiguedad?: number,

    //Rustica
    poligono?: number,
    parcela?: number,
    paraje?: string,
    m2_parcela?: number,
    
    //Datos extra
    uso?: string
    m2_construidos?: number,
    pdf_url?: string,

    lat?: number,
    lng?: number,
    foto?:string


}
