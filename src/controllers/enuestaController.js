const service = require('../services/encuestaService')

function validateNumberParameter(res, id_proyecto, id_usuario) { 
    if (isNaN(id_proyecto)) {
      return res.status(400).json({ error: `Parameter id_proyecto should be a number` });
    }
    if (isNaN(id_usuario)) {
      return res.status(400).json({ error: `Parameter id_usuario should be a number` });
    }
  }

const getEncuesta = async(req, res) => {
    const { params: { id_proyecto } } = req
    const { id_usuario, rol } = req.body

    validateNumberParameter(res, id_proyecto, id_usuario)

    try {
        res.status(200).json(await service.getEncuesta(id_proyecto, id_usuario, rol))
    } catch(error) {
        const statusCode = error.status || 500
        res.status(statusCode).json({ message: error.message })
    }

}

const postEncuesta = async(req, res) =>{
    const { params: { id_proyecto } } = req
    const { id_usuario, respuestas } = req.body

    validateNumberParameter(res, id_proyecto, id_usuario)

    try {
        res.status(200).json(await service.postEncuesta(id_proyecto, id_usuario, respuestas))
    } catch(error) {
        const statusCode = error.status || 500
        res.status(statusCode).json({ message: error.message })
    }

}

module.exports = {
    getEncuesta,
    postEncuesta
}