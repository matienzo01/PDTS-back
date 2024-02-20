const TABLE = 'proyectos'
const knex = require('../database/knex')

const getAllProjects = async (id_institucion) => {
  const proyectos = await knex(TABLE).select().where({ id_institucion: id_institucion })

  for (let i = 0; i < proyectos.length; i++) {
    proyectos[i].participantes = await knex('evaluadores_x_proyectos')
      .join('evaluadores', 'evaluadores_x_proyectos.id_evaluador', 'evaluadores.id')
      .select('evaluadores.id', 'evaluadores.nombre', 'evaluadores.apellido', 'evaluadores_x_proyectos.rol', 'evaluadores_x_proyectos.fecha_inicio_eval', 'evaluadores_x_proyectos.fecha_fin_eval', 'evaluadores_x_proyectos.fecha_fin_op')
      .where({ id_proyecto: proyectos[i].id })
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

  const participants = await queryBuilder('evaluadores_x_proyectos')
    .join('evaluadores', 'evaluadores_x_proyectos.id_evaluador', 'evaluadores.id')
    .select('evaluadores.id', 'evaluadores.nombre', 'evaluadores.apellido', 'evaluadores_x_proyectos.rol', 'evaluadores_x_proyectos.fecha_inicio_eval', 'evaluadores_x_proyectos.fecha_fin_eval', 'evaluadores_x_proyectos.fecha_fin_op')
    .where({ id_proyecto: id_proyecto })

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

  return { proyecto: project[0], participantes: participants };
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

const createProject = async (id_institucion, proyecto) => {
  const fecha = new Date()
  const fecha_carga = `${fecha.getFullYear()}-${fecha.getMonth() + 1}-${fecha.getDate()}`

  proyecto.fecha_carga = fecha_carga
  proyecto.id_institucion = parseInt(id_institucion)
  proyecto.id_estado_eval = 1 //sin evaluar

  const result = await knex.transaction(async (trx) => {
    const insertId = await trx.insert(proyecto).into(TABLE)
    await asignEvaluador(proyecto.id_director, insertId[0], id_institucion, fecha_carga, 'director', trx)
    const newProject = await getOneProject(insertId[0], id_institucion, trx)
    return newProject
  })

  return result
}

const deleteProject = async () => {

}

module.exports = {
  getAllProjects,
  getOneProject,
  createProject,
  deleteProject,
  assignEvaluador
}