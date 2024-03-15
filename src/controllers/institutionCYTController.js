const service = require('../services/institutionCYTService.js')

const getOneInstitucionCYT = async (req, res) => {
  const { params: { id_institucion } } = req

  if (isNaN(id_institucion)) {
    res.status(400).json({ error: "Parameter ':id_institucion' should be a number" })
    return;
  }

  try {
    res.status(200).json(await service.getOneInstitucionCYT(id_institucion))
  } catch (error) {
    const statusCode = error.status || 500
    res.status(statusCode).json({ error: error.message })
  }
  return;
}

const getAllInstitucionesCYT = async (req, res) => {
  try {
    res.status(200).json(await service.getAllInstitucionesCYT())
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener las instituciones' })
  }
}

const getTiposInstituciones = async (req, res) => {
  try {
    res.status(200).json(await service.getTiposInstituciones())
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener los tipos de instituciones' })
  }
}

const createInstitucionCYT = async (req, res) => {

  if(!req.body.hasOwnProperty('admin')) {
    res.status(400).json({ error: "Missing admin" })
    return;
  }

  if(!req.body.hasOwnProperty('institucion')) {
    res.status(400).json({ error: "Missing admin" })
    return;
  }

  const { admin, institucion } = req.body

  if (!admin.nombre ||
    !admin.apellido ||
    !admin.email ||
    !admin.password) {
    res.status(400).json({ error: "Missing fields in the admin" })
    return;
  }

  if (!institucion.id_tipo ||
    !institucion.nombre ||
    !institucion.pais ||
    !institucion.provincia ||
    !institucion.localidad ||
    !institucion.telefono_institucional ||
    !institucion.mail_institucional ||
    !institucion.nombre_referente ||
    !institucion.apellido_referente ||
    !institucion.cargo_referente ||
    !institucion.telefono_referente ||
    !institucion.mail_referente ||
    !institucion.rubro) {
    res.status(400).json({ error: "Missing fields in the institucion" })
    return;
  }

  try {
    res.status(200).json(await service.createInstitucionCYT(admin, institucion))
  } catch (error) {
    res.status(409).json({ error: error.message })
  }
}

const deleteInstitucionCYT = async (req, res) => {
  const { params: { id_institucion } } = req

  if (isNaN(id_institucion)) {
    res.status(400).json({ error: "Parameter ':id_institucion' should be a number" })
    return;
  }

  try {
    res.status(204).json(await service.deleteInstitucionCYT(id_institucion))
  } catch (error) {
    res.status(500).json({ error: `Error al eliminar la institucion con id ${id_institucion}` })
  }
  return;
}

module.exports = {
  getOneInstitucionCYT,
  getAllInstitucionesCYT,
  createInstitucionCYT,
  deleteInstitucionCYT,
  getTiposInstituciones
}