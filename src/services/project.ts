import { Knex } from "knex"
import { CustomError } from "../types/CustomError"
import { InstitucionParticipante } from "../types/InstitucionParticipante"
import { promises as fs } from 'fs';

const TABLE = 'proyectos'
import knex from '../database/knex'
import mailer from './mailer'
import institutionCYT from "./institutionCYT"
import user from "./user"
import Files from "./Files"

const getAllProjects = async() => {
  const proyectos = await knex('proyectos').select()

  for (let i = 0; i < proyectos.length; i++) {
    proyectos[i].informe_director = await Files.getNombreInforme(proyectos[i].titulo)
    proyectos[i].participantes = await getParticipants(proyectos[i].id)
    proyectos[i].instituciones_participantes = await getInstParticipants(proyectos[i].id)
    proyectos[i].director = await getDirector(proyectos[i])
  }
  return { proyectos: proyectos }
}

const getAllInstitutionProjects = async (id_institucion: number) => {
  const proyectos = await knex('proyectos').select().where({ id_institucion: id_institucion })

  for (let i = 0; i < proyectos.length; i++) {
    proyectos[i].informe_director = await Files.getNombreInforme(proyectos[i].titulo)
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

  if (!project) {
    throw new CustomError('No existe un proyecto con el id dado', 404)
  }

  const participants = await getParticipants(id_proyecto, queryBuilder)
  const participating_insts = await getInstParticipants(id_proyecto, queryBuilder)
  const nombre_informe = await Files.getNombreInforme(project.titulo)

  if (id_institucion && project.id_institucion != id_institucion) {
    throw new CustomError('El proyecto no esta asociado a la institucion o la institucion no existe', 403)
  }

  return { proyecto: { ...project, informe_director: nombre_informe, participantes: participants, instituciones_participantes: participating_insts } };
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
    .select('nombre as institucion', 'rol','pais','provincia','localidad','telefono_institucional','mail_institucional', 'id')
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
}

const userBelongsToInstitution = async (id_evaluador: number, id_institucion: number) => {
  const inst = await knex('instituciones_cyt').select().where({ id: id_institucion }).first()
  if (inst === undefined) {
    throw new CustomError('No existe una institucion con el id dado', 404)
  }
  return await knex('evaluadores_x_instituciones').select().where({ id_institucion, id_evaluador }).first() === undefined
    ? false
    : true
}

const assignEvaluador = async (data: any, id_institucion: number, trx: any = null) => {
  const { proyecto } = await getOneProject(data.id_proyecto, id_institucion, trx)
  
  if(proyecto.id_estado_eval == 4 ) {
    throw new CustomError('La evaluacion ya fue cerrada, no se puede agregar un nuevo evaluador', 409)
  }

  if (!await userBelongsToInstitution(data.id_evaluador, id_institucion)) {
    throw new CustomError('El usuario no esta asociado a la institucion que administra el proyecto', 409)
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
      throw new CustomError('El usuario ya esta vinculado al proyecto', 409)
    } else {
      throw error
    }
  }
  return { ...data };
}

const unassignEvaluador = async (id_evaluador: number, id_proyecto: number) => {
  const {proyecto} = await getOneProject(id_proyecto)

  if(proyecto.id_estado_eval == 4 ) {
    throw new CustomError('La evaluacion ya fue cerrada, no se puede desvincular un evaluador', 409)
  }

  const evaluador = await knex('evaluadores_x_proyectos').select().where({ id_evaluador, id_proyecto }).first()
  if ( evaluador === undefined ){
    throw new CustomError('No existe un usuario con el id dado vinculado al proyecto', 404)
  }

  if (evaluador.rol === 'director'){
    throw new CustomError('No se puede desvincular al director de su propio proyecto', 409)
  }

  return await knex.transaction(async (trx) => { 
    Files.deleteUserFundamentaciones(proyecto.titulo, id_evaluador)
    await trx('respuestas_evaluacion').del().where({ id_evaluador, id_proyecto })
    await trx('respuestas_encuesta').del().where({ id_evaluador, id_proyecto })
    await trx('evaluadores_x_proyectos').del().where({ id_evaluador, id_proyecto })
  })
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
    throw new CustomError("El proyecto debe tener al menos una institucion demandante, una ejecutora y una adoptante", 400)
  }

  if ((await knex('proyectos').select().where({titulo: proyecto.titulo})).length > 0) {
    throw new CustomError("Ya existe un proyecto con el mismo nombre en el sistema", 409)
  }

  const modelo = await knex('modelos_encuesta').select().where({id: proyecto.id_modelo_encuesta}).first()
  if(!modelo || modelo.editable) {
    throw new CustomError('El id del modelo de encuesta dado no corresponde con un modelo existente o que sea utilizable en este momento', 404)
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
    const {proyecto: newProject} = await getOneProject(insertId[0], id_institucion, trx)
    newProject.director = await getDirector(newProject, trx)
    mailer.notifyReviewer(newProject.titulo, newProject.director, inst)
    return newProject
  })

  return result
}

const deleteProject = async (id_institucion: number, id_proyecto: number, trxx: any = null) => {
  const {titulo} = (await getOneProject(id_proyecto, id_institucion)).proyecto

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
    Files.deleteProjectFolder(titulo)
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
      Files.deleteProjectFolder(titulo)
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
      throw new CustomError('El usuario no esta vinculado al proyecto', 403)
  }

  return assigned
}

const updateProject = async(project: any, id:number) => {
  const { titulo: oldTitulo } = (await getOneProject(id)).proyecto
  const roles = project.roles

  const check = await knex('proyectos').select().where({titulo: project.titulo}).first()
  if (check != undefined && check.id != id) {
    throw new CustomError("Ya existe un proyecto diferente con el mismo nombre en el sistema", 409)
  }

  const hasEjecutora = roles.some((item: any) => item.rol.toLocaleLowerCase() === 'ejecutora');
  const hasDemandante = roles.some((item: any) => item.rol.toLocaleLowerCase() === 'demandante');
  const hasAdoptante = roles.some((item: any) => item.rol.toLocaleLowerCase() === 'adoptante');
  
  if (!hasEjecutora || !hasDemandante || !hasAdoptante) {
    throw new CustomError("El proyecto debe tener al menos una institucion demandante, una ejecutora y una adoptante", 400)
  }

  delete project.roles
  await knex.transaction(async (trx: any): Promise<any> => { 
    await trx('proyectos').where({id}).update(project)
    await trx('participacion_instituciones').where({id_proyecto: id}).delete()
    await assignInstitutionRoles(id, roles, trx)
  })

  const updatedProject = await getOneProject(id);

  if(oldTitulo != updatedProject.proyecto.titulo) {
    try {
      Files.moveDirectoryContents(`uploads/${oldTitulo}`, `uploads/${updatedProject.proyecto.titulo}`)
    } catch(error) {
      console.log(error)
    }
  }


  updatedProject.proyecto.director = await getDirector(updatedProject.proyecto)

  return updatedProject
}

export default {
  getAllProjects,
  getDirector,
  getAllInstitutionProjects,
  getOneProject,
  createProject,
  deleteProject,
  assignEvaluador,
  unassignEvaluador,
  getParticipants,
  getProjectsByUser,
  verifyState,
  verify_date,
  updateProject
}