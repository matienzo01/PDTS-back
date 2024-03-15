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

  if(!req.body.hasOwnProperty('institucion')){
    return res.status(400).json({ error: "Missing institution" })
  }

  const { institucion } = req.body

  if (
    !institucion.hasOwnProperty('nombre') ||
    !institucion.hasOwnProperty('pais') ||
    !institucion.hasOwnProperty('provincia') ||
    !institucion.hasOwnProperty('localidad') ||
    !institucion.hasOwnProperty('rubro') ||
    !institucion.hasOwnProperty('telefono_institucional') ||
    !institucion.hasOwnProperty('mail_institucional') ||
    !institucion.esCyt === undefined) {
    return res.status(400).json({ error: "Missing fields in institution" })
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