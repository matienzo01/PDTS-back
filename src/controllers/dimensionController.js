const service = require('../services/dimensionService')

const getAllDimensions = async (req,res) => {

    const {id_instancia} = req.query

    if (isNaN(id_instancia)) {
        res.status(400).json({ error: "Parameter ':id_instancia' should be a number"})
        return ;
    }

    try {
        res.status(200).json(await service.getAllDimensions(id_instancia))
    } catch(error){
        res.status(500).json({ error: 'Error getting all dimensions'})
    }
}

const getOneDimension = async (req,res) => {
    const { params: { id_dimension }} = req

    if (isNaN(id_dimension)) {
        res.status(400).json({ error: "Parameter ':id_dimension' should be a number"})
        return ;
    }

    try {
        res.status(200).json(await service.getOneDimension(id_dimension))
    } catch (error) {
        const statusCode = error.status || 500
        res.status(statusCode).json({ error: error.message})
    }
}

const createDimension = async (req,res) => {
    const { dimension } = req.body

    if (
        !dimension.nombre ||
        !dimension.id_instancia) {
            res.status(400).json({ error: "Missing fields"})
            return ;
    }

    try {
        res.status(201).json( await service.createDimension(dimension))
    } catch(error) {
        const statusCode = error.status || 500
        res.status(statusCode).json({ error: error.message})
    }
}

const deleteDimension = async (req,res) => {
    const { params: { id_dimension } } = req

    if (isNaN(id_dimension)) {
        res.status(400).json({ error: "Parameter ':id_dimension' should be a number"})
        return ;
    }

    try {
        res.status(204).json(await service.deleteDimension(id_dimension))
    } catch (error) {
        const statusCode = error.status || 500
        const message = error.status ? error.message : 'Error deleting the dimension'
        res.status(statusCode).json({ error: message})
    }
}

const updateDimension = async (req,res) => {
    const { params: { id_dimension } } = req
    const {dimension} = req.body

    if (isNaN(id_dimension)) {
        res.status(400).json({ error: "Parameter ':id_dimension' should be a number"})
        return ;
    }
    
    try {
        res.status(200).json(await service.updateDimension(id_dimension,dimension))
    } catch (error) {
        const statusCode = error.status || 500
        const message = error.status ? error.message : 'Error deleting the dimension'
        res.status(statusCode).json({ error: message})
    }
}

module.exports = {
    getAllDimensions,
    getOneDimension,
    createDimension,
    deleteDimension,
    updateDimension
}