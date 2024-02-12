const knex = require('../database/knex.js')
const TABLE = 'dimensiones'

const getAllDimensions = async (id_instancia) => {
    try {
        const conds = id_instancia ? {id_instancia: id_instancia} : {};
        return {dimensiones: await knex.select().where(conds).from(TABLE)};
    } catch (error) {
        throw error;
    }
}

const getOneDimension = async(id) => { 
    try {
        const dim = await knex.select().where({id}).from(TABLE)
        return {dimension: dim[0]}
    } catch(error) {
        throw error;
    }
}

const createDimension = async (dimension) => {
    try {
        const NewDimension = {
            nombre: dimension.nombre,
            id_instancia: dimension.id_instancia
        }
        const insertId = parseInt(await knex(TABLE).insert(NewDimension))
        return await getOneDimension(insertId)
    } catch(error) {
        throw error
    }   

}

const deleteDimension = async (id) => {
    try {
        return await knex(TABLE).del().where({id})
    } catch(error) {
        throw error
    }
}

module.exports = {
    getAllDimensions,
    getOneDimension,
    createDimension,
    deleteDimension
}