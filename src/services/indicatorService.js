const gen_consulta = require('../database/gen_consulta')

const getAllIndicators = async(id_instancia, id_dimension) => {

    const table = (!id_dimension && id_instancia) ? 'instancias ins JOIN dimensiones dim ON ins.id = dim.id_instancia JOIN indicadores ind ON dim.id = ind.id_dimension' : 'indicadores ind';
    const conds = id_dimension ? [`id_dimension = ${id_dimension}`] : id_instancia ? [`ins.id = ${id_instancia}`] : null;
    const columns = 'ind.id,pregunta,fundamentacion,id_dimension,determinante,fecha_elim'

    try {
        return {indicadores: await gen_consulta._select(table,columns,conds)}
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

const createIndicator = async(indicator) => {
    try {
        const insertData = await gen_consulta._insert('indicadores(pregunta,fundamentacion,id_dimension,determinante)',Object.values(indicator))
        const insertedIndicator = await gen_consulta._select('indicadores',null,[`id = ${insertData.insertId}`])
        return {newIndicator : insertedIndicator[0]}
    } catch(error) {
        throw error;
    }
}

const deleteIndicator = async(id_indicador) => {
    try {
        const conds = [`id = ${id_indicador}`]
        return await gen_consulta._delete('indicadores',conds)
    } catch(error) {
        throw error
    }
}

module.exports = {
    getAllIndicators,
    getOneIndicator,
    createIndicator,
    deleteIndicator
}