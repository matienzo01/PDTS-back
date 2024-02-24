const TABLE = 'proyectos'
const knex = require('../database/knex')

const getAllProjects = async (id_institucion) => {
  const proyectos = await knex(TABLE).select().where({ id_institucion: id_institucion })

  for (let i = 0; i < proyectos.length; i++) {
    proyectos[i].participantes = await getParticipants(proyectos[i].id)
    proyectos[i].instituciones_participantes = await getInstParticipants(proyectos[i].id)
    console.log(proyectos[i])
  }

  /* no se si estoy quemado o que, pero no pude hacer andar esto asi que use el for de arriba
  proyectos.forEach(async (proyecto) => {
    proyecto.participantes = await knex('evaluadores_x_proyectos')
      .join('evaluadores', 'evaluadores_x_proyectos.id_evaluador', 'evaluadores.id')
      .select('evaluadores.id', 'evaluadores.nombre', 'evaluadores.apellido', 'evaluadores_x_proyectos.rol', 'evaluadores_x_proyectos.fecha_inicio_eval', 'evaluadores_x_proyectos.fecha_fin_eval', 'evaluadores_x_proyectos.fecha_fin_op')
      .where({ id_proyecto: proyecto.id })
  })*/
  return { proyectos: proyectos }
}

const getOneProject = async (id_proyecto, id_institucion = null, trx = null) => {
  const queryBuilder = trx || knex;

  const project = await queryBuilder(TABLE)
    .select()
    .where({ id: id_proyecto });

  const participants = await getParticipants(id_proyecto, queryBuilder)
  const participating_insts = await getInstParticipants(id_proyecto, queryBuilder)

  if (!project[0]) {
    const _error = new Error('There is no project with the provided id')
    _error.status = 404
    throw _error
  }

  if (id_institucion && project[0].id_institucion != id_institucion) {
    const _error = new Error('The project is not linked to the institution')
    _error.status = 403
    throw _error
  }

  return { proyecto: { ...project[0], participantes: participants, instituciones_participantes: participating_insts } };
}

const getParticipants = async (id_proyecto, trx = null) => {
  const queryBuilder = trx || knex;
  const participantes = await queryBuilder('evaluadores_x_proyectos')
    .join('evaluadores', 'evaluadores_x_proyectos.id_evaluador', 'evaluadores.id')
    .select('evaluadores.id', 'evaluadores.nombre', 'evaluadores.apellido', 'evaluadores_x_proyectos.rol', 'evaluadores_x_proyectos.fecha_inicio_eval', 'evaluadores_x_proyectos.fecha_fin_eval', 'evaluadores_x_proyectos.fecha_fin_op')
    .where({ id_proyecto: id_proyecto })

  return participantes;
}

const getInstParticipants = async (id_proyecto, trx = null) => {
  const queryBuilder = trx || knex;
  const participaciones = await queryBuilder('participacion_instituciones')
    .join('instituciones', 'participacion_instituciones.id_institucion', 'instituciones.id')
    .select('nombre as institucion', 'rol')
    .where('participacion_instituciones.id_proyecto', id_proyecto)
  //console.log(participaciones)
  return participaciones
}

const getProjectsByUser = async (id_usuario) => {
  const proyectos = await knex('evaluadores_x_proyectos').join('proyectos', 'evaluadores_x_proyectos.id_proyecto', 'proyectos.id').select().where({ id_evaluador: id_usuario })
  return { proyectos: proyectos }
}

const userBelongsToInstitution = async (id_evaluador, id_institucion) => {

  const inst = await knex('instituciones_cyt').select().where({ id: id_institucion })
  if (inst[0] === undefined) {
    const _error = new Error('There is no institution with the provided id')
    _error.status = 404
    throw _error
  }
  const a = await knex('evaluadores_x_instituciones').select().where({ id_institucion, id_evaluador })

  return a[0] === undefined ? false : true

}

const assignEvaluador = async (id_evaluador, id_proyecto, id_institucion, fecha_carga, rol, trx = null) => {
  const data = {
    id_evaluador: id_evaluador,
    id_proyecto: id_proyecto,
    fecha_inicio_eval: fecha_carga,
    rol: rol
  }

  await getOneProject(id_proyecto, null, trx)

  if (!await userBelongsToInstitution(id_evaluador, id_institucion)) {
    const _error = new Error('The user is not associated with the institution that owns the project')
    _error.status = 409
    throw _error
  }

  const queryBuilder = trx || knex;
  try {
    await queryBuilder('evaluadores_x_proyectos').insert(data)
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      const _error = new Error('The user is already asigned to the project')
      _error.status = 409
      throw _error
    } else {
      throw error
    }
  }

}

const unassignEvaluador = async (id_evaluador, id_proyecto) => {
  //habria que ver de no eliminar al evaluador director
  if (!await knex('evaluadores_x_proyectos').del().where({ id_evaluador, id_proyecto })) {
    const _error = new Error('The user is not assigned to this project')
    _error.status = 404
    throw _error
  }
  return;
}

const assignInstitutionRoles = async (id_proyecto, roles, trx) => {
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

const createProject = async (id_institucion, proyecto, roles) => {
  const fecha = new Date()
  const fecha_carga = `${fecha.getFullYear()}-${fecha.getMonth() + 1}-${fecha.getDate()}`

  proyecto.fecha_carga = fecha_carga
  proyecto.id_institucion = parseInt(id_institucion)
  proyecto.id_estado_eval = 1 //sin evaluar

  const result = await knex.transaction(async (trx) => {
    const insertId = await trx.insert(proyecto).into(TABLE)
    await assignInstitutionRoles(insertId[0], roles, trx)
    await assignEvaluador(proyecto.id_director, insertId[0], id_institucion, fecha_carga, 'director', trx)
    const newProject = await getOneProject(insertId[0], id_institucion, trx)
    return newProject
  })

  return result
}

const deleteProject = async (id_institucion, id_proyecto) => {
  await getOneProject(id_proyecto, id_institucion)

  await knex.transaction(async (trx) => {
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

module.exports = {
  getAllProjects,
  getOneProject,
  createProject,
  deleteProject,
  assignEvaluador,
  unassignEvaluador,
  getParticipants,
  getProjectsByUser
}