const gen_consulta = require('../database/gen_consulta')

const getAllIndicators = async(id_instancia, id_dimension) => {

    const table = (!id_dimension && id_instancia) ? 'instituciones ins JOIN dimensiones dim ON ins.id = dim.id_instancia JOIN indicadores ind ON dim.id = ind.id_dimension' : 'indicadores';
    const conds = id_dimension ? [`id_dimension = ${id_dimension}`] : id_instancia ? [`ins.id = ${id_instancia}`] : null;

    try {
        return {indicadores: await gen_consulta._select(table,null,conds)}
    } catch(error) {
        throw error
    }
    
}

const getOneIndicator = async(id_indicador) => {

    try {
        return {indicador: await gen_consulta._select('indicadores',null,[`id = ${id_indicador}`])}
    } catch (error) {
        throw error
    }
}

const createIndicator = async() => {
    return ;
}

const deleteIndicator = async() => {
    return ;
}

module.exports = {
    getAllIndicators,
    getOneIndicator,
    createIndicator,
    deleteIndicator
}