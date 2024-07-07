export interface RespuestaEval {
    id_indicador?: number;
    id_evaluador: number;
    justificacion: string | null;
    option: string | null
    value: number | null
}