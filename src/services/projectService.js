const TABLE = 'proyectos'
const knex = require('../database/knex')

const getAllProjects = async (id_institucion) => {
    return {proyectos: await knex(TABLE).select().where({id_institucion: id_institucion})}
}

const getOneProject = async (id_institucion,id_proyecto,trx= null) => {
    const queryBuilder = trx || knex;

    const project = await queryBuilder(TABLE)
        .select()
        .where({ id: id_proyecto, id_institucion: id_institucion });

    return { proyecto: project[0] };
    
}

const asignEvaluador = async(id_director,id_proyecto,fecha_carga,rol,trx = null) => {
    const data = {
        id_evaluador: id_director,
        id_proyecto: id_proyecto,
        fecha_inicio_eval: fecha_carga,
        rol: rol
    }

    const queryBuilder = trx || knex;
    await queryBuilder('evaluadores_x_proyectos').insert(data)
}

const createProject = async (id_institucion,proyecto) => {

    const fecha = new Date()
    const fecha_carga = `${fecha.getFullYear()}-${fecha.getMonth() + 1}-${fecha.getDate()}`

    proyecto.fecha_carga = fecha_carga
    proyecto.id_institucion = id_institucion
    proyecto.id_estado_eval = 1 //sin evaluar


    //habria que chequear si el director corresponde a la institucion
    const result = await knex.transaction(async (trx) => {

        const insertId = await trx.insert(proyecto).into(TABLE)
        const newProject = await getOneProject(id_institucion,insertId[0],trx)
        const {id_director} = newProject.proyecto
        await asignEvaluador(id_director,insertId[0],fecha_carga,'director',trx)
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