const servicio = require('../services/dimensionService')

const getAllDimensions = async (req,res) => {
    try {
        res.status(200).json(await servicio.getAllDimensions())
    } catch {
        console.error('Error al obtener todas las dimensiones', error)
        res.status(500).json({ error: 'Error al obtener todas las dimensiones'})
    }
}

const getOneDimension = async (req,res) => {
    const { params: { id_dimension }} = req

    if (!id_dimension) return;

    try {
        res.status(200).json(await servicio.getOneDimension(id_dimension))
    } catch {
        console.error('Error al obtener la dimensione', error)
        res.status(500).json({ error: 'Error al obtener todas la dimension'})
    }
}

const createDimension = async (req,res) => {
    const { body } = req

    if (
        !body.nombre ||
        !body.id_instancia
    ) return ;

    try {
        const params = Object.values(body)
        res.status(201).json( await servicio.createDimension(params))
    } catch(error) {
        console.error('Error al insertar', error)
        res.status(500).json({ error: 'Error al insertar la dimension'})
    }
}

const deleteDimension = async (req,res) => {
    const {
        body,
        params: { id_dimension }
    } = req

    if (!id_dimension) return;

    try {
        res.status(200).json(await servicio.deleteDimension(id_dimension))
    } catch {
        console.error('Error al eliminar', error)
        res.status(500).json({ error: 'Error al eliminar el elemento'})
    }
}

module.exports = {
    getAllDimensions,
    getOneDimension,
    createDimension,
    deleteDimension
}