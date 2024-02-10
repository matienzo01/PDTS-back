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

const asignDirector = async(id_director,id_proyecto,fecha_carga) => {
    const tabla = 'evaluadores_x_proyectos(id_proyecto,id_evaluador,rol,fecha_inicio_eval)'

    const director = [id_proyecto,id_director,'director',fecha_carga]
    console.log(director)
    try {
        return await gen_consulta._insert(tabla,director)
    } catch {
        throw error;
    }

}

const createProject = async (proyecto) => {

    const insert_table = TABLE.concat('(titulo,id_director,FechaInicio,FechaFin,area_conocim,subarea_conocim,problema_a_resolver,producto_a_generar,resumen,novedad_u_originalidad,grado_relevancia,grado_pertinencia,grado_demanda,obligatoriedad_proposito,obligatoriedad_opinion,id_institucion,fecha_carga,id_estado_eval)')
    const fecha = new Date()
    const fecha_carga = `${fecha.getFullYear()}-${fecha.getMonth() + 1}-${fecha.getDate()}`
    proyecto.push(fecha_carga)
    proyecto.push(1) // este es el id del estado de la evaluacion. id = 1 ==> Sin evaluar

    try {
        const projectInsert = await gen_consulta._insert(insert_table,[proyecto])
        const directorInsert = await asignDirector(proyecto[1],projectInsert.insertId,fecha_carga)
        
        return {directorInsert:directorInsert, projectInsert:projectInsert }
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