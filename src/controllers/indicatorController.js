const service = require('../services/indicatorService')

const getAllIndicators = async(req,res) => {
    const {id_instancia, id_dimension} = req.query

    if (isNaN(id_dimension)) {
        res.status(400).json({ error: "Parameter ':id_dimension' should be a number"})
        return ;
    }

    if (isNaN(id_instancia)) {
        res.status(400).json({ error: "Parameter ':id_instancia' should be a number"})
        return ;
    }

    try {
        res.status(200).json(await service.getAllIndicators(id_instancia, id_dimension))
    } catch(error) {
        const statusCode = error.status || 500
        const message = error.status ? error.message : 'Error getting all indicators'
        res.status(statusCode).json({ error: message})
    }
}

const getOneIndicator = async(req,res) => {
    const {params: { id_indicador }} = req

    if (isNaN(id_indicador)) {
        res.status(400).json({ error: "Parameter ':id_indicador' should be a number"})
        return ;
    }

    try {
        res.status(200).json(await service.getOneIndicator(id_indicador))
    } catch(error) {
        const statusCode = error.status || 500
        const message = error.status ? error.message : 'Error getting the indicator'
        res.status(statusCode).json({ error: message})
    }
}

const createIndicator = async(req,res) => {
    const {indicador} = req.body

    if (
        !indicador.pregunta ||
        !indicador.fundamentacion ||
        !indicador.id_dimension ||
        !indicador.determinante) {
            res.status(400).json({ error: "Missing fields"})
            return ;
    }

    try {
        res.status(201).json(await service.createIndicator(indicador))
    } catch (error){
        console.log(error)
        const statusCode = error.status || 500
        const message = error.status ? error.message : 'Error creating the indicator'
        res.status(statusCode).json({ error: message})
    }
}

const deleteIndicator = async(req,res) => {
    const { params: { id_indicador } } = req

    if (isNaN(id_indicador)) {
        res.status(400).json({ error: "Parameter ':id_indicador' should be a number"})
        return ;
    }

    try {
        res.status(204).json(await service.deleteIndicator(id_indicador))
    } catch (error){
        const statusCode = error.status || 500
        const message = error.status ? error.message : 'Error deleting the indicator'
        res.status(statusCode).json({ error: message})
    }
}

const updateIndicator = async(req, res) => {
    const { params: { id_indicador } } = req
    const { indicador } = req.body
    console.log(indicador, id_indicador)
    try {
        res.status(200).json(await service.updateIndicator(id_indicador, indicador))
    } catch (error){
        console.log(error)
        const statusCode = error.status || 500
        const message = error.status ? error.message : 'Error updating the indicator'
        res.status(statusCode).json({ error: message})
    }
}

module.exports = {
    getAllIndicators,
    getOneIndicator,
    createIndicator,
    deleteIndicator,
    updateIndicator
}