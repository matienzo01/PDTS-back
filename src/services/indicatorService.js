const knex = require('../database/knex.js')
const questionService = require('./questionService')
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

const getOneIndicator = async(id,trx = null) => {
    const queryBuilder = trx || knex
    const indicator = await queryBuilder(TABLE).select().where({id}).first();
    if(indicator   === undefined) {
        const _error = new Error('There is no indicator with the provided id ')
        _error.status = 404
        throw _error
    }
    return {indicador: indicator}
}

const createIndicator = async(indicator) => {

    const newIndicator = {
        pregunta: indicator.pregunta,
        fundamentacion: indicator.fundamentacion,
        id_dimension: indicator.id_dimension,
        determinante: indicator.determinante,
    }

    try {
        return await knex.transaction(async(trx) => {
            const indicator_id = parseInt(await trx(TABLE).insert(newIndicator))

            const question = {
                pregunta: newIndicator.pregunta,
                id_seccion: null,
                id_padre: 6,
                id_tipo_pregunta: 1,
                opciones: [
                    { id_opcion: 5},
                    { id_opcion: 6},
                    { id_opcion: 7},
                    { id_opcion: 8}
                ]
            }
            await questionService.creteQuestion(question)
            return await getOneIndicator(indicator_id,trx) 
        })
    } catch (error) {
        if (error.code === 'ER_NO_REFERENCED_ROW_2') {
            const _error = new Error('There is no dimension with the provided id')
            _error.status = 404
            throw _error
        }
        throw error;
    }
    
}

const deleteIndicator = async(id) => {
    /*
    const fecha = new Date()
    await knex(TABLE)
        .where({ id })
        .update({ fecha_elim: `${fecha.getFullYear()}-${fecha.getMonth() + 1}-${fecha.getDate()}`})
    */
    if (!await knex(TABLE).del().where({id})){
        const _error = new Error('There is no indicator with the provided id ')
        _error.status = 404
        throw _error
    }
    return ;
}

const updateIndicator = async (id, updatedFields ) => {
    await knex(TABLE).where({ id }).update(updatedFields)
    return await getOneIndicator(id)
}

module.exports = {
    getAllIndicators,
    getOneIndicator,
    createIndicator,
    deleteIndicator,
    updateIndicator
}