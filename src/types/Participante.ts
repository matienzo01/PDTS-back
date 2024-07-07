export interface Participante {
    id: number;
    nombre: string;
    apellido: string;
    rol: string;
    fecha_inicio_eval: string;
    fecha_fin_eval: string | null;
    fecha_fin_op: string | null;
}