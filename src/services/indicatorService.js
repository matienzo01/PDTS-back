const knex = require('../database/knex.js')
const TABLE = 'indicadores'

const getAllIndicators = async(id_instancia, id_dimension) => {

    const query = knex(TABLE)

    if (id_dimension) {
        query.where({ id_dimension });
    } else if (id_instancia) {
        query.join('dimensiones', 'indicadores.id_dimension', 'dimensiones.id')
             .join('instancias', 'dimensiones.id_instancia', 'instancias.id')
             .select('indicadores.id', 'pregunta', 'fundamentacion', 'id_dimension', 'determinante', 'fecha_elim')
             .where('instancias.id', '=', id_instancia);
    }

    return { indicadores: await query };    
}

const getOneIndicator = async(id) => {
    const indicator = await knex(TABLE).select().where({id})
    if(indicator[0]   === undefined) {
        const _error = new Error('There is no indicator with the provided id ')
        _error.status = 404
        throw _error
    }
    return {indicador: indicator[0]}
}

const createIndicator = async(indicator) => {

    const newIndicator = {
        pregunta: indicator.pregunta,
        fundamentacion: indicator.fundamentacion,
        id_dimension: indicator.id_dimension,
        determinante: indicator.determinante,
    }

    const insertId = parseInt(await knex(TABLE).insert(newIndicator))
    
    //aca habria que agregar una pregunta a la encuesta de opinion con el indicador insertado

    return await getOneIndicator(insertId) 
}

const deleteIndicator = async(id) => {

    if (!await knex(TABLE).del().where({id})){
        const _error = new Error('There is no indicator with the provided id ')
        _error.status = 404
        throw _error
    }
    return ;
}

module.exports = {
    getAllIndicators,
    getOneIndicator,
    createIndicator,
    deleteIndicator
}