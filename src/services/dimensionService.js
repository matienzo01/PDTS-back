const gen_consulta = require('../database/gen_consulta')
const TABLA = 'dimensiones'

const getAllDimensions = async (id_instancia) => {
    try {
        const conds = id_instancia ? [`id_instancia = ${id_instancia}`] : null;
        return {dimensiones: await gen_consulta._select(TABLA, null, conds)};
    } catch (error) {
        throw error;
    }
}


const getOneDimension = async(id) => { 
    try {
        const condiciones = [`id = ${id}`]
        return {dimension: await gen_consulta._select(TABLA,null,condiciones)}
    } catch(error) {
        throw error;
    }
}

const createDimension = async (params) => {
    try {
        const insertData = await gen_consulta._insert(TABLA.concat('(nombre,id_instancia)'),params)
        const insertedDimension = await gen_consulta._select(TABLA,null,[`id = ${insertData.insertId}`])
        return {dimension: insertedDimension[0]}
    } catch(error) {
        throw error
    }   

}

const deleteDimension = async (id) => {
    try {
        const conds = [`id = ${id}`]
        return await gen_consulta._delete(TABLA,conds)
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