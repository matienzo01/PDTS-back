const TABLE = 'proyectos'
const knex = require('../database/knex')

const getAllProjects = async (id_institucion) => {
  return { proyectos: await knex(TABLE).select().where({ id_institucion: id_institucion }) }
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
    const _error = new Error('There is no proyect with the provided id')
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

const asignEvaluador = async (id_director, id_proyecto, fecha_carga, rol, trx = null) => {
  const data = {
    id_evaluador: id_director,
    id_proyecto: id_proyecto,
    fecha_inicio_eval: fecha_carga,
    rol: rol
  }

  const queryBuilder = trx || knex;
  await queryBuilder('evaluadores_x_proyectos').insert(data)
}

const createProject = async (id_institucion, proyecto) => {

  const fecha = new Date()
  const fecha_carga = `${fecha.getFullYear()}-${fecha.getMonth() + 1}-${fecha.getDate()}`

  proyecto.fecha_carga = fecha_carga
  proyecto.id_institucion = parseInt(id_institucion)
  proyecto.id_estado_eval = 1 //sin evaluar

  //habria que chequear si el director corresponde a la institucion
  const result = await knex.transaction(async (trx) => {

    const insertId = await trx.insert(proyecto).into(TABLE)
    await asignEvaluador(proyecto.id_director, insertId[0], fecha_carga, 'director', trx)
    const newProject = await getOneProject(insertId[0],id_institucion, trx)
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
  deleteProject
}