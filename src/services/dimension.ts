import knex from '../database/knex';
import { Dimension } from '../types/Dimension'
import { CustomError } from '../types/customError';
const TABLE = 'dimensiones'

const getAllDimensions = async (id_instancia?: number) => {
    const conds = id_instancia ? {id_instancia: id_instancia} : {};
    return {dimensiones: await knex.select().where(conds).from(TABLE)};
}

const getOneDimension = async(id: number) => { 
    const dim: Dimension | undefined = await knex.select().where({id}).from(TABLE).first();
    if(dim === undefined) {
        const _error: CustomError = new Error('There is no dimension with the provided id ')
        _error.status = 404
        throw _error
    }
    return { dimension: dim }
}

const createDimension = async (dimension: Dimension) => {
    const NewDimension: Partial<Dimension> = {
        nombre: dimension.nombre,
        id_instancia: dimension.id_instancia
    }
    const insertId: number = parseInt(await knex(TABLE).insert(NewDimension))
    return await getOneDimension(insertId)  
}

const deleteDimension = async (id: number) => {

    await knex.transaction(async(trx) => {
        if (!await trx(TABLE).del().where({id})){
            const _error: CustomError = new Error('There is no dimension with the provided id ')
            _error.status = 404
            throw _error
        }
    })
    return ;
}

const updateDimension = async (id: number, updatedFields: Partial<Dimension>) => {
    await knex(TABLE).where({ id: id }).update(updatedFields)
    return await getOneDimension(id)
}

export default {
    getAllDimensions,
    getOneDimension,
    createDimension,
    deleteDimension,
    updateDimension
}
