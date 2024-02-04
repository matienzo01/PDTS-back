const servicio = require('../services/servicio_dimensiones')

const getAllDimensiones = async (req,res) => {
    try {
        res.status(200).json(await servicio.getAllDimensiones())
    } catch {
        console.error('Error al obtener todas las dimensiones', error)
        res.status(500).json({ error: 'Error al obtener todas las dimensiones'})
    }
}

const getOneDimensiones = async (req,res) => {
    const {
        body,
        params: { id_dimension }
    } = req

    if (!id_dimension) return;

    try {
        res.status(200).json(await servicio.getOneDimensiones(id_dimension))
    } catch {
        console.error('Error al obtener la dimensione', error)
        res.status(500).json({ error: 'Error al obtener todas la dimension'})
    }
}

const createDimensiones = async (req,res) => {
    const { body } = req

    if (
        !body.nombre ||
        !body.id_instancia
    ) return ;

    try {
        const params = Object.values(body)
        res.status(201).json( await servicio.createDimensiones(params))
    } catch(error) {
        console.error('Error al insertar', error)
        res.status(500).json({ error: 'Error al insertar la dimension'})
    }
}

const updateDimensiones = async (req,res) => {
    const updatedDimension = servicio.updateDimensiones(req.params.id_dimension)
    res.send('update dimensiones')
}

const deleteDimensiones = async (req,res) => {
    const {
        body,
        params: { id_dimension }
    } = req

    if (!id_dimension) return;

    try {
        res.status(200).json(await servicio.deleteDimensiones(id_dimension))
    } catch {
        console.error('Error al eliminar', error)
        res.status(500).json({ error: 'Error al eliminar el elemento'})
    }
}

module.exports = {
    getAllDimensiones,
    getOneDimensiones,
    createDimensiones,
    updateDimensiones,
    deleteDimensiones
}