export interface Question {
    pregunta: string;
    id_seccion: number | null
    id_padre: number | null
    id_tipo_pregunta: number
    opciones: {id_opcion: number}[]
}