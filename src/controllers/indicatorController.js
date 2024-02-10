const service = require('../services/indicatorService')

const getAllIndicators = async(req,res) => {
    const {id_instancia, id_dimension} = req.query
    try {
        res.status(200).json(await service.getAllIndicators(id_instancia, id_dimension))
    } catch(error) {
        res.status(500).json({ error: 'Error getting all the indicators'})
    }
}

const getOneIndicator = async(req,res) => {
    const {params: { id_indicador }} = req

    if (isNaN(id_indicador)) {
        res.status(400).send({
          status: "FAILED",
          data : { error: "Parameter ':id_indicador' should be a number"}
        })
        return ;
    }

    try {
        res.status(200).json(await service.getOneIndicator(id_indicador))
    } catch(error) {
        res.status(500).json({ error: 'Error getting all the indicators'})
    }
    return ;
}

const createIndicator = async(req,res) => {
    return ;
}

const deleteIndicator = async(req,res) => {
    return ;
}

module.exports = {
    getAllIndicators,
    getOneIndicator,
    createIndicator,
    deleteIndicator
}