import { Dimension } from "./Dimension";
import { OpcionInstancia } from "./OpcionInstancia";

export interface Instancia {
    nobmre_instancia: string;
    dimensiones: { [nombre: string]: Dimension};
    opciones: OpcionInstancia
}