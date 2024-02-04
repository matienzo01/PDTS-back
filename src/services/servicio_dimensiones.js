const gen_consulta = require('../database/gen_consulta')
const TABLA = 'dimensiones'

const getAllDimensiones = async () => {
    try {
        return await gen_consulta._select(TABLA, null, null);
    } catch (error) {
        throw error;
    }
}


const getOneDimensiones = async(id) => { 
    try {
        const condiciones = [`id = ${id.replace(/:/g, '')}`]
        return await gen_consulta._select(TABLA,null,condiciones)
    } catch(error) {
        throw error;
    }
}

const createDimensiones = async (params) => {
    try {
        return await gen_consulta._insert(TABLA.concat('(nombre,id_instancia)'),params)
    } catch(error) {
        throw error
    }   

}

const updateDimensiones = async () => {
    return ;
}

const deleteDimensiones = async (id) => {
    try {
        const condiciones = [`id = ${id.replace(/:/g, '')}`]
        return await gen_consulta._delete(TABLA,condiciones)
    } catch(error) {

    }

    return ;
}

module.exports = {
    getAllDimensiones,
    getOneDimensiones,
    createDimensiones,
    updateDimensiones,
    deleteDimensiones
}