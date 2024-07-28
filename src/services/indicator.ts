import questionService from './question'
import knex from '../database/knex';
import { Knex } from 'knex';
import { CustomError } from '../types/CustomError';
import { Indicador } from '../types/Indicador';
import { Question } from '../types/Question';
const TABLE = 'indicadores'

const getAllIndicators = async(id_instancia: number, id_dimension: number) => {

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

const getOneIndicator = async(id: number , trx: any = null) => {
    const queryBuilder = trx || knex
    const indicator = await queryBuilder(TABLE).select().where({id}).first();
    if(indicator   === undefined) {
        throw new CustomError('No existe un indicador con el id dado', 404)
    }
    return {indicador: indicator}
}

const createIndicator = async(indicator: Indicador) => {

    try {
        return await knex.transaction(async(trx: Knex.Transaction) => {
            const indicator_id = parseInt(await trx(TABLE).insert(indicator))

            const question: Question = {
                pregunta: indicator.pregunta,
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
            return await getOneIndicator(indicator_id, trx) 
        })
    } catch (error) {
        if ((error as any).code === 'ER_NO_REFERENCED_ROW_2') {
            throw new CustomError('No existe una dimension con el id dado', 404)
        }
        throw error;
    }
    
}

const deleteIndicator = async(id: number) => {
    /*
    const fecha = new Date()
    await knex(TABLE)
        .where({ id })
        .update({ fecha_elim: `${fecha.getFullYear()}-${fecha.getMonth() + 1}-${fecha.getDate()}`})
    */
    if (!await knex(TABLE).del().where({id})){
        throw new CustomError('No existe un indicador con el id dado', 404)
    }
    return ;
}

const updateIndicator = async (id: number, updatedFields: Partial<Indicador>  ) => {
    await knex(TABLE).where({ id }).update(updatedFields)
    return await getOneIndicator(id)
}

export default {
    getAllIndicators,
    getOneIndicator,
    createIndicator,
    deleteIndicator,
    updateIndicator
}