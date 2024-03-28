export interface RespuestaEncuesta {
    id_evaluador: number;
    id_pregunta?: number;
    respuesta: string | null;
    optionId: number | null
}