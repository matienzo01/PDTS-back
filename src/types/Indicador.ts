import { RespuestaEval } from "./RespuestaEval";

export interface Indicador {
    id_indicador: number;
    pregunta: string;
    fundamentacion: string;
    id_dimension: number;
    determinante: number;
    descripcion: string;
    respuestas?: RespuestaEval[]
}