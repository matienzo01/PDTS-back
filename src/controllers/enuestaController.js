const service = require('../services/encuestaService')

const getEncuesta = async(req, res) => {
    const { params: { id_proyecto } } = req
    const { id_usuario, rol } = req.body

    try {
        res.status(200).json(await service.getEncuesta(id_proyecto))
    } catch(error) {
        const statusCode = error.status || 500
        res.status(statusCode).json({ message: error.message })
    }

}

const postEncuesta = async(req, res) =>{
    const { params: { id_proyecto } } = req
    const { id_usuario, rol } = req.body

    try {
        res.status(200).json(await service.postEncuesta())
    } catch(error) {
        const statusCode = error.status || 500
        res.status(statusCode).json({ message: error.message })
    }

}

module.exports = {
    getEncuesta,
    postEncuesta
}