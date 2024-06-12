import { Knex } from "knex"
import { CustomError } from "../types/CustomError"
import { InstitucionParticipante } from "../types/InstitucionParticipante"

const TABLE = 'proyectos'
import knex from '../database/knex'
import mailer from './mailer'
import institutionCYT from "./institutionCYT"
import user from "./user"

const getAllProjects = async (id_institucion: number) => {
  const proyectos = await knex(TABLE).select().where({ id_institucion: id_institucion })

  for (let i = 0; i < proyectos.length; i++) {
    proyectos[i].participantes = await getParticipants(proyectos[i].id)
    proyectos[i].instituciones_participantes = await getInstParticipants(proyectos[i].id)
    proyectos[i].director = await getDirector(proyectos[i])
  }
  return { proyectos: proyectos }
}

const getOneProject = async (id_proyecto: number, id_institucion: number | null = null, trx: any = null) => {
  const queryBuilder = trx || knex;

  const project = await queryBuilder(TABLE)
    .select()
    .where({ id: id_proyecto })
    .first();


  const participants = await getParticipants(id_proyecto, queryBuilder)
  const participating_insts = await getInstParticipants(id_proyecto, queryBuilder)

  if (!project) {
    throw new CustomError('There is no project with the provided id', 404)
  }

  if (id_institucion && project.id_institucion != id_institucion) {
    throw new CustomError('The project is not linked to the institution or the institution does not exist', 403)
  }

  return { proyecto: { ...project, participantes: participants, instituciones_participantes: participating_insts } };
}

const getParticipants = async (id_proyecto: number, trx: any = null) => {
  const queryBuilder = trx || knex;
  const participantes = await queryBuilder('evaluadores_x_proyectos')
    .join('evaluadores', 'evaluadores_x_proyectos.id_evaluador', 'evaluadores.id')
    .select('evaluadores.id', 'evaluadores.nombre', 'evaluadores.apellido', 'evaluadores.dni', 'evaluadores_x_proyectos.rol', 'evaluadores_x_proyectos.fecha_inicio_eval', 'evaluadores_x_proyectos.fecha_fin_eval', 'evaluadores_x_proyectos.fecha_fin_op')
    .where({ id_proyecto: id_proyecto })

  return participantes;
}

const getInstParticipants = async (id_proyecto: number, trx: any = null) => {
  const queryBuilder = trx || knex;
  const participaciones = await queryBuilder('participacion_instituciones')
    .join('instituciones', 'participacion_instituciones.id_institucion', 'instituciones.id')
    .select('nombre as institucion', 'rol','rubro','pais','provincia','localidad','telefono_institucional','mail_institucional')
    .where('participacion_instituciones.id_proyecto', id_proyecto)
  return participaciones
}

const getDirector = async(proyecto: any, trx: any = null) => {
  const queryBuilder = trx || knex;
  const director = proyecto.participantes.find((p: any) => p.rol === 'director')
  const {usuario}  = await user.getOneUser(director.id, queryBuilder)
  usuario.fecha_inicio_eval = director.fecha_inicio_eval
  usuario.fecha_fin_eval = director.fecha_fin_eval
  usuario.fecha_fin_op = director.fecha_fin_op
  return usuario
}

const getProjectsByUser = async (id_usuario: number) => {
  const proyectos = await knex('evaluadores_x_proyectos').join('proyectos', 'evaluadores_x_proyectos.id_proyecto', 'proyectos.id').select().where({ id_evaluador: id_usuario })
  
  for(const proyecto of proyectos){
    proyecto.instituciones_participantes = await getInstParticipants(proyecto.id)
    proyecto.participantes = await getParticipants(proyecto.id)
    proyecto.director = await getDirector(proyecto)
  }

  return {proyectos: proyectos}

  /*
  return { proyectos: proyectos.filter(proyecto => {
      return !(proyecto.id_estado_eval < 3 && proyecto.id_director !== id_usuario);
    }) 
  }*/
}

const userBelongsToInstitution = async (id_evaluador: number, id_institucion: number) => {

  const inst = await knex('instituciones_cyt').select().where({ id: id_institucion }).first()
  if (inst === undefined) {
    throw new CustomError('There is no institution with the provided id', 404)
  }
  return await knex('evaluadores_x_instituciones').select().where({ id_institucion, id_evaluador }).first() === undefined
    ? false
    : true
}

const assignEvaluador = async (data: any, id_institucion: number, trx: any = null) => {
  
  const { proyecto } = await getOneProject(data.id_proyecto, id_institucion, trx)
  
  if(proyecto.id_estado_eval == 4 ) {
    throw new CustomError('The evaluation has already been closed. You cant add a new evaluator', 409)
  }

  if (!await userBelongsToInstitution(data.id_evaluador, id_institucion)) {
    throw new CustomError('The user is not associated with the institution that owns the project', 409)
  }

  const queryBuilder = trx || knex;
  try {
    await queryBuilder('evaluadores_x_proyectos').insert(data)
    const user = await queryBuilder('evaluadores').where({id: data.id_evaluador}).first()
    const {institucion_CYT: inst} = await institutionCYT.getOneInstitucionCYT(id_institucion)
    mailer.notifyReviewer(proyecto.titulo, user, inst)
  } catch (error) {
    // @ts-ignore
    if (error.code === 'ER_DUP_ENTRY') {
      throw new CustomError('The user is already asigned to the project', 409)
    } else {
      throw error
    }
  }
  return { ...data };
}

const unassignEvaluador = async (id_evaluador: number, id_proyecto: number) => {
  const {proyecto} = await getOneProject(id_proyecto)

  if(proyecto.id_estado_eval == 4 ) {
    throw new CustomError('The evaluation has already been closed. You cant add a new evaluator', 409)
  }

  const evaluador = await knex('evaluadores_x_proyectos').select().where({ id_evaluador, id_proyecto }).first()
  if ( evaluador === undefined ){
    throw new CustomError('There is no user with the providied id linked to the project', 409)
  }

  if (evaluador.rol === 'director'){
    throw new CustomError('You cannot remove a director from his or her own project', 409)
  }

  await knex('evaluadores_x_proyectos').del().where({ id_evaluador, id_proyecto })
  return;
}

const assignInstitutionRoles = async (id_proyecto: number, roles: InstitucionParticipante[], trx: any) => {
  roles.forEach(async (element) => {
    // hay que verificar que no haya mas de un ¿demandante?
    const participacion = {
      id_proyecto: id_proyecto,
      id_institucion: element.institucion_id,
      rol: element.rol
    }
    await trx('participacion_instituciones').insert(participacion)
  })
}

const createProject = async (id_institucion: number, proyecto: any, roles: InstitucionParticipante[]) => {

  const { institucion_CYT: inst} = await institutionCYT.getOneInstitucionCYT(id_institucion)

  const hasEjecutora = roles.some(item => item.rol.toLocaleLowerCase() === 'ejecutora');
  const hasDemandante = roles.some(item => item.rol.toLocaleLowerCase() === 'demandante');
  const hasAdoptante = roles.some(item => item.rol.toLocaleLowerCase() === 'adoptante');
  
  if (!hasEjecutora || !hasDemandante || !hasAdoptante) {
    throw new CustomError("The project must have at least one demanding institution, one executor and one adopter.", 400)
  }

  const fecha = new Date()
  const fecha_carga = `${fecha.getFullYear()}-${fecha.getMonth() + 1}-${fecha.getDate()}`

  proyecto.fecha_carga = fecha_carga
  proyecto.id_institucion = id_institucion
  proyecto.id_estado_eval = 1 
  const result = await knex.transaction(async (trx) => {

    const insertId = await trx.insert(proyecto).into(TABLE)
    await assignInstitutionRoles(insertId[0], roles, trx)

    const data = {
      id_evaluador: proyecto.id_director,
      id_proyecto: insertId[0],
      fecha_inicio_eval: fecha_carga,
      rol: 'director'
    }

    await assignEvaluador(data, id_institucion, trx)
    const newProject = await getOneProject(insertId[0], id_institucion, trx)
    
    const director = await trx('evaluadores').select().where({ id: newProject.proyecto.id_director }).first()
    mailer.notifyReviewer(newProject.proyecto.titulo, director, inst)
    return newProject
  })

  return result
}

const deleteProject = async (id_institucion: number, id_proyecto: number, trxx: any = null) => {
  await getOneProject(id_proyecto, id_institucion)

  if(trxx) {
    await trxx('respuestas_evaluacion').del().where({ id_proyecto })
    await trxx('respuestas_encuesta').del().where({ id_proyecto })
    // 2) desasignar los evaluadores del proyecto
    await trxx('evaluadores_x_proyectos').del().where({ id_proyecto })
    // 3) eliminar los elementos de la tabla de 'participacion_instituciones' correspondientes al proyecto
    await trxx('participacion_instituciones').del().where({ id_proyecto })
    // 4) eliminar los participantes del proyecto (los que integraron el grupo de trabajo que llevo acabo el proyecto)
    await trxx('participantes_x_proyectos').del().where({ id_proyecto })
    // 5) eliminar el proyecto
    await trxx('proyectos').del().where({ id: id_proyecto })
  } else {
    await knex.transaction(async (trx: any): Promise<any> => {
      // 1) eliminar las respuestas de los evaluadores
      await trx('respuestas_evaluacion').del().where({ id_proyecto })
      await trx('respuestas_encuesta').del().where({ id_proyecto })
  
      // 2) desasignar los evaluadores del proyecto
      await trx('evaluadores_x_proyectos').del().where({ id_proyecto })
  
      // 3) eliminar los elementos de la tabla de 'participacion_instituciones' correspondientes al proyecto
      await trx('participacion_instituciones').del().where({ id_proyecto })
  
      // 4) eliminar los participantes del proyecto (los que integraron el grupo de trabajo que llevo acabo el proyecto)
      await trx('participantes_x_proyectos').del().where({ id_proyecto })
  
      // 5) eliminar el proyecto
      await trx('proyectos').del().where({ id: id_proyecto })
    })
  }

}

const verifyState = async( id_proyecto: number, state: string ) => {
  const [ estados, {proyecto}] = await Promise.all([
    knex('estado_eval').select(),
    getOneProject(id_proyecto)
  ])
  
  return proyecto.id_estado_eval === estados.filter((estado: any) => estado.nombre == state)[0].id
}

const verify_date = async (id_proyecto: number, id_evaluador: number) => {
  const assigned = await knex('evaluadores_x_proyectos').select()
      .where({ id_proyecto: id_proyecto, id_evaluador: id_evaluador })
      .first()
  
  if(!assigned) {
      throw new CustomError('The user is not linked to the project', 403)
  }

  return assigned
}

export default {
  getDirector,
  getAllProjects,
  getOneProject,
  createProject,
  deleteProject,
  assignEvaluador,
  unassignEvaluador,
  getParticipants,
  getProjectsByUser,
  verifyState,
  verify_date
}