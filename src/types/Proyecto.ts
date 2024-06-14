import { InstitucionParticipante } from "./InstitucionParticipante";
import { Participante } from "./Participante";

export interface Proyecto {
    id: number;
    titulo: string;
    id_estado_eval: number;
    id_director: number;
    id_institucion: number;
    FechaInicio: string;
    FechaFin: string;
    area_conocim: string;
    subarea_conocim: string;
    problema_a_resolver: string;
    producto_a_generar: string;
    resumen: string;
    novedad_u_originalidad: string;
    relevancia: string;
    pertinencia: string;
    demanda: string;
    fecha_carga: string;
    obligatoriedad_proposito: number;
    participantes: Participante[];
    instituciones_participantes: InstitucionParticipante[];
    id_modelo_encuesta: number
}