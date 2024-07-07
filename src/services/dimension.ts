import knex from '../database/knex';
import { Dimension } from '../types/Dimension'
import { CustomError } from '../types/CustomError';
const TABLE = 'dimensiones'

const getAllDimensions = async () => {
    return {dimensiones: await knex.select().from(TABLE)};
}

const getOneDimension = async(id: number) => { 
    const dim: Dimension | undefined = await knex.select().where({id}).from(TABLE).first();
    if(dim === undefined) {
        throw new CustomError('There is no dimension with the provided id ', 404)
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
        // hay que eliminar los indicadores asociados
        if (!await trx(TABLE).del().where({id})){
            throw new CustomError('There is no dimension with the provided id ', 404)
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
