import { CustomError } from '../types/CustomError';
import institutionCytService from '../services/institutionCYT'
const ROLES = ['ADOPTANTE','DEMANDANTE','EJECUTORA','PROMOTORA','FINANCIADORA']

const validateProject = (proyecto: any) => {
  if (!proyecto.hasOwnProperty("titulo") ||
    !proyecto.hasOwnProperty("id_director") ||
    !proyecto.hasOwnProperty("FechaInicio") ||
    !proyecto.hasOwnProperty("FechaFin") ||
    !proyecto.hasOwnProperty("area_conocim") ||
    !proyecto.hasOwnProperty("subarea_conocim") ||
    !proyecto.hasOwnProperty("problema_a_resolver") ||
    !proyecto.hasOwnProperty("producto_a_generar") ||
    !proyecto.hasOwnProperty("resumen") ||
    !proyecto.hasOwnProperty("novedad_u_originalidad") ||
    !proyecto.hasOwnProperty("relevancia") ||
    !proyecto.hasOwnProperty("pertinencia") ||
    !proyecto.hasOwnProperty("demanda") ||
    !proyecto.hasOwnProperty('obligatoriedad_proposito') ||
    !proyecto.hasOwnProperty('obligatoriedad_opinion') ||
    !proyecto.hasOwnProperty('id_modelo_encuesta') ||
    !proyecto.hasOwnProperty("roles")) {
      throw new CustomError('Faltan atributos en el proyecto', 400)
  }
}

const validateNumberParameter = (variable: any, nombre: string) => { 
    if (isNaN(variable)) {
      throw new CustomError(`El parametro ${nombre} debe ser un numero`, 400)
    }
}

const ownInstitution = async(rol: string, id_admin: number, id_institucion: number) => {
    if(rol !== 'admin general' && await institutionCytService.getInstIdFromAdmin(id_admin) != id_institucion) {
      throw new CustomError('Un administrador solo puede trabajar con su propia institucion', 403)
    }
}

const checRolesInstituciones = (roles: {institucion_id: number, rol: string}[]) => {
  for (let element of roles) {
    if (!ROLES.includes(element.rol)) {
      throw new CustomError(`Se ingreso un rol invalido (id_institucion: ${element.institucion_id}, rol: ${element.rol})`, 400)
    }
  }
}

export default {
    validateNumberParameter,
    ownInstitution,
    checRolesInstituciones,
    validateProject
}