const service = require('../services/sectionService')

const getAllSecciones = async (req,res) => {

    try {
        res.status(200).json(await service.getAllSecciones())
    } catch(error){
        const statusCode = error.status || 500
        res.status(statusCode).json({ error: error.message})
    }
}

const getOneSeccion = async (req,res) => {
    const { params: { id_seccion }} = req

    if (isNaN(id_seccion)) {
        res.status(400).json({ error: "Parameter ':id_seccion' should be a number"})
        return ;
    }

    try {
        res.status(200).json(await service.getOneSeccion(id_seccion))
    } catch (error) {
        const statusCode = error.status || 500
        res.status(statusCode).json({ error: error.message})
    }
}

const createSeccion = async (req,res) => {
    const { seccion } = req.body

    if (!seccion.nombre) {
        res.status(400).json({ error: "Missing fields"})
        return ;
    }

    try {
        res.status(201).json( await service.createSeccion(seccion))
    } catch(error) {
        const statusCode = error.status || 500
        res.status(statusCode).json({ error: error.message})
    }
}

const deleteSeccion = async (req,res) => {
    const { params: { id_seccion } } = req

    if (isNaN(id_seccion)) {
        res.status(400).json({ error: "Parameter ':id_seccion' should be a number"})
        return ;
    }

    try {
        res.status(204).json(await service.deleteSeccion(id_seccion))
    } catch (error) {
        const statusCode = error.status || 500
        const message = error.status ? error.message : 'Error deleting the seccion'
        res.status(statusCode).json({ error: message})
    }
}

const updateSeccion = async (req,res) => {
    const { params: { id_seccion } } = req
    const { seccion } = req.body

    if (isNaN(id_seccion)) {
        res.status(400).json({ error: "Parameter ':id_seccion' should be a number"})
        return ;
    }

    try {
        res.status(200).json(await service.updateSeccion(id_seccion,seccion))
    } catch (error) {
        const statusCode = error.status || 500
        const message = error.status ? error.message : 'Error updating the seccion'
        res.status(statusCode).json({ error: message})
    }
}

module.exports = {
    getAllSecciones,
    getOneSeccion,
    createSeccion,
    deleteSeccion,
    updateSeccion
}