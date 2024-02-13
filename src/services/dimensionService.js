const knex = require('../database/knex.js')
const TABLE = 'dimensiones'

const getAllDimensions = async (id_instancia) => {
    const conds = id_instancia ? {id_instancia: id_instancia} : {};
    return {dimensiones: await knex.select().where(conds).from(TABLE)};
}

const getOneDimension = async(id) => { 
    const dim = await knex.select().where({id}).from(TABLE)
    if(dim[0]   === undefined) {
        const _error = new Error('There is no dimension with the provided id ')
        _error.status = 404
        throw _error
    }
    return {dimension: dim[0]}
}

const createDimension = async (dimension) => {
    const NewDimension = {
        nombre: dimension.nombre,
        id_instancia: dimension.id_instancia
    }
    const insertId = parseInt(await knex(TABLE).insert(NewDimension))
    return await getOneDimension(insertId)  
}

const deleteDimension = async (id) => {

    if (!await knex(TABLE).del().where({id})){
        const _error = new Error('There is no dimension with the provided id ')
        _error.status = 404
        throw _error
    }
    return ;
}

module.exports = {
    getAllDimensions,
    getOneDimension,
    createDimension,
    deleteDimension
}