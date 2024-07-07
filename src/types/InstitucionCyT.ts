import { Institucion } from "./Institucion";

export interface InstitucionCyT extends Institucion {
    id_admin: number
    id_tipo: number
    nombre_referente: string
    apellido_referente: string
    cargo_referente: string
    telefono_referente: string
    mail_referente: string
}