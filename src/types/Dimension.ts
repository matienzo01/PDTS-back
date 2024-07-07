import { Indicador } from "./Indicador";

export interface Dimension {
    id_dimension: number;
    nombre?: string;
    id_instancia?: number;
    indicadores?: Partial<Indicador>[]
}