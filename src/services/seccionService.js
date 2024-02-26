const knex = require('../database/knex.js')
const TABLE = 'secciones'

const getAllSecciones = async () => {
    return {secciones: await knex.select().from(TABLE)};
}

const getOneSeccion = async(id) => { 
    const seccion = await knex.select().where({id}).from(TABLE).first();
    if(seccion === undefined) {
        const _error = new Error('There is no seccion with the provided id ')
        _error.status = 404
        throw _error
    }
    return {seccion: seccion}
}

const createSeccion = async (seccion) => {
    const insertId = parseInt(await knex(TABLE).insert(seccion))
    return await getOneSeccion(insertId)  
}

const deleteSeccion = async (id) => {

    await knex.transaction(async(trx) => {
        if (!await trx(TABLE).del().where({id})){
            const _error = new Error('There is no seccion with the provided id ')
            _error.status = 404
            throw _error
        }
    })
    return ;
}

const updateSeccion = async (id, updatedFields ) => {
    await knex(TABLE).where({ id }).update(updatedFields)
    return await getOneSeccion(id)
}

module.exports = {
    getAllSecciones,
    getOneSeccion,
    createSeccion,
    deleteSeccion,
    updateSeccion
}