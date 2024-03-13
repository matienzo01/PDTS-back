const service = require('../services/institutionService.js')

const getInstituciones = async (req, res) => {
  try {
    res.status(200).json(await service.getInstituciones())
  } catch (error) {
    const statusCode = error.status || 500
    res.status(statusCode).json({ error: error.message })
  }
}

const getOneInstitucion = async (req, res) => {
  const { params: { inst_id } } = req

  if (isNaN(inst_id)) {
    return res.status(400).json({ error: "Parameter ':inst_id' should be a number" })
  }

  try {
    res.status(200).json(await service.getOneInstitucion(inst_id))
  } catch (error) {
    const statusCode = error.status || 500
    res.status(statusCode).json({ error: error.message })
  }
}

const createInstitucion = async (req, res) => {
  const { institucion } = req.body

  if (
    !institucion.nombre ||
    !institucion.pais ||
    !institucion.provincia ||
    !institucion.localidad ||
    !institucion.rubro ||
    !institucion.telefono_institucional ||
    !institucion.mail_institucional ||
    !institucion.esCyt === undefined) {
    return res.status(400).json({ error: "Missing fields" })
  }

  try {
    res.status(200).json(await service.createInstitucion(institucion))
  } catch (error) {
    const statusCode = error.status || 500
    res.status(statusCode).json({ error: error.message })
  }
}

module.exports = {
  getInstituciones,
  getOneInstitucion,
  createInstitucion
}