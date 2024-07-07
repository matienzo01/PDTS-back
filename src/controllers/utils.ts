import { CustomError } from '../types/CustomError';
import institutionCytService from '../services/institutionCYT'
const ROLES = ['ADOPTANTE','DEMANDANTE','EJECUTORA','PROMOTORA','FINANCIADORA']

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
    checRolesInstituciones
}