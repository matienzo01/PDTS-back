const gen_consulta = require('../database/gen_consulta')

const getAllIndicators = async(id_instancia, id_dimension) => {

    let table = 'indicadores'
    let conds = null

    if (id_dimension){
        conds = [`id_dimension = ${id_dimension}`]
    } else if (id_instancia) {
        table.concat(' ins JOIN dimensiones dim ON ins.id = dim.id_instancia JOIN indicadores ind ON dim.id = ind.id_dimension')
        conds = [`ins.id = ${id_instancia}`]
    }
    try {
        return await gen_consulta._select(table,null,conds)
    } catch(error) {
        throw error
    }
    
}

const getOneIndicator = async(id_indicador) => {

    try {
        return await gen_consulta._select('indicadores',null,[`id = ${id_indicador}`])
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