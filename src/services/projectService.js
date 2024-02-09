const gen_consulta = require('../database/gen_consulta')
const TABLE = 'proyectos'

const getAllProjects = async (id_institucion) => {
    try {
        const conds = [`id_institucion = ${id_institucion}`]
        return await gen_consulta._select(TABLE,null,conds)
    } catch(error) {
        throw error
    }
}

const getOneProject = async (id_institucion,id_proyecto) => {
    try {
        const conds = [
            `id_institucion = ${id_institucion}`,
            `id = ${id_proyecto}`]
        return await gen_consulta._select(TABLE,null,conds)
    } catch(error) {
        throw error
    }
}

const createProject = async (proyecto) => {

    const insert_table = TABLE.concat('(titulo,id_director,FechaInicio,FechaFin,area_conocim,subarea_conocim,problema_a_resolver,producto_a_generar,resumen,novedad_u_originalidad,grado_relevancia,grado_pertinencia,grado_demanda,obligatoriedad_proposito,obligatoriedad_opinion,id_institucion,fecha_carga,id_estado_eval)')
    const fecha = new Date()
    const fecha_carga = `${fecha.getFullYear()}-${fecha.getMonth() + 1}-${fecha.getDate()}`
    proyecto.push(fecha_carga)
    proyecto.push(1) // este es el id del estado de la evaluacion. id = 1 ==> Sin evaluar

    console.log(proyecto)
    try {
        return await gen_consulta._insert(insert_table,[proyecto])
    } catch(error) {
        throw error
    }

}

const deleteProject = async () => {

}

module.exports = {
    getAllProjects, 
    getOneProject,
    createProject,
    deleteProject
}