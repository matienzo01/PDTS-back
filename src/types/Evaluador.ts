export interface Evaluador {
    id: number;
    email: string;
    password?: string;
    nombre: string;
    apellido: string;
    dni: number;
    cellar: string;
    institucion_origen: string;
    pais_residencia: string;
    provincia_residencia: string
    localidad_residencia: string;
}