import knex from'../database/knex'
import { CustomError } from '../types/CustomError';
import { Section } from '../types/Section.js';
const TABLE = 'secciones'

const getAllSecciones = async () => {
    return {secciones: await knex.select().from(TABLE)};
}

const getOneSeccion = async(id: number) => { 
    const seccion = await knex.select().where({id}).from(TABLE).first();
    if(seccion === undefined) {
        const _error: CustomError = new Error('There is no seccion with the provided id ')
        _error.status = 404
        throw _error
    }
    return {seccion: seccion}
}

const createSeccion = async (seccion: Partial<Section>) => {
    const insertId = parseInt(await knex(TABLE).insert(seccion))
    return await getOneSeccion(insertId)  
}

const deleteSeccion = async (id: number) => {

    await knex.transaction(async(trx) => {
        if (!await trx(TABLE).del().where({id})){
            const _error: CustomError = new Error('There is no seccion with the provided id ')
            _error.status = 404
            throw _error
        }
    })
    return ;
}

const updateSeccion = async (id: number, updatedFields: Partial<Section> ) => {
    await knex(TABLE).where({ id }).update(updatedFields)
    return await getOneSeccion(id)
}

export default {
    getAllSecciones,
    getOneSeccion,
    createSeccion,
    deleteSeccion,
    updateSeccion
}