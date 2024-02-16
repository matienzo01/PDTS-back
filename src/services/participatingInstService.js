const knex = require('../database/knex.js')
const TABLE = 'instituciones_participantes'

const getParticipatingInst = async() => {
    return {instituciones_participantes: await knex.select().from(TABLE)};
}   

const getOneParticipatingInst = async(id) => {
    const inst = await knex.select().where({id}).from(TABLE)
    if(inst[0] === undefined) {
        const _error = new Error('There is no participating institution with the provided id ')
        _error.status = 404
        throw _error
    }
    return {institucion: inst[0]}
}  

const createParticipatingInst = async(institution) => {
    const insertId = parseInt(await knex(TABLE).insert(institution))
    return await getOneParticipatingInst(insertId)  
}  

module.exports = {
    getParticipatingInst,
    getOneParticipatingInst,
    createParticipatingInst
}