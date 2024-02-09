const service = require('../services/dimensionService')

const getAllDimensions = async (req,res) => {
    try {
        res.status(200).json(await service.getAllDimensions())
    } catch {
        res.status(500).json({ error: 'Error al obtener todas las dimensiones'})
    }
}

const getOneDimension = async (req,res) => {
    const { params: { id_dimension }} = req

    if (isNaN(id_dimension)) {
        res.status(400).send({
          status: "FAILED",
          data : { error: "Parameter ':id_dimension' should be a number"}
        })
        return ;
    }

    try {
        res.status(200).json(await service.getOneDimension(id_dimension))
    } catch {
        res.status(500).json({ error: 'Error al obtener todas la dimension'})
    }
}

const createDimension = async (req,res) => {
    const { body } = req

    if (
        !body.nombre ||
        !body.id_instancia) {
            res.status(400).send({
                status: 'FAILED',
                data : { error: "Missing fields"}
            })
            return ;
    }

    try {
        res.status(201).json( await service.createDimension(Object.values(body)))
    } catch(error) {
        res.status(500).json({ error: 'Error al insertar la dimension'})
    }
}

const deleteDimension = async (req,res) => {
    const { params: { id_dimension } } = req

    if (isNaN(id_dimension)) {
        res.status(400).send({
          status: "FAILED",
          data : { error: "Parameter ':id_dimension' should be a number"}
        })
        return ;
    }

    try {
        res.status(200).json(await service.deleteDimension(id_dimension))
    } catch {
        res.status(500).json({ error: 'Error al eliminar el elemento'})
    }
}

module.exports = {
    getAllDimensions,
    getOneDimension,
    createDimension,
    deleteDimension
}