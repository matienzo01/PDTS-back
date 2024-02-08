const gen_consulta = require('../database/gen_consulta')
const TABLA = 'dimensiones'

const getAllDimensions = async () => {
    try {
        return await gen_consulta._select(TABLA, null, null);
    } catch (error) {
        throw error;
    }
}


const getOneDimension = async(id) => { 
    try {
        const condiciones = [`id = ${id}`]
        return await gen_consulta._select(TABLA,null,condiciones)
    } catch(error) {
        throw error;
    }
}

const createDimension = async (params) => {
    try {
        return await gen_consulta._insert(TABLA.concat('(nombre,id_instancia)'),params)
    } catch(error) {
        throw error
    }   

}

const deleteDimension = async (id) => {
    try {
        const condiciones = [`id = ${id}`]
        return await gen_consulta._delete(TABLA,condiciones)
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