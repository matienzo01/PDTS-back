const service = require('../services/institutionService.js')

const getOneInstitucion = async (req, res) => {
  const { params: { id_institucion } } = req

  if (isNaN(id_institucion)) {
    res.status(400).json({ error: "Parameter ':id_institucion' should be a number"})
    return ;
  }

  try {
    res.status(200).json(await service.getOneInstitucion(id_institucion))
  } catch (error) {
    res.status(500).json({ error: `Error al obtener la institucion con id ${id_institucion}` })
  }
  return;
}

const getAllInstituciones = async (req, res) => {
  try {
    res.status(200).json(await service.getAllInstituciones())
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener las instituciones' })
  }
}

const createInstitucion = async (req, res) => {
  const { admin, institucion } = req.body

  if (!admin.nombre ||
    !admin.apellido ||
    !admin.email ||
    !admin.password) {
      res.status(400).json({ error: "Missing fields in the admin"})
    return;
  }

  if (!institucion.id_tipo ||
    !institucion.nombre ||
    !institucion.pais ||
    !institucion.provincia ||
    !institucion.localidad ||
    !institucion.telefono_institucional ||
    !institucion.mail_institucional||
    !institucion.nombre_referente||
    !institucion.apellido_referente||
    !institucion.cargo_referente||
    !institucion.telefono_referente||
    !institucion.mail_referente||
    !institucion.rubro) {
      res.status(400).json({ error: "Missing fields in the institucion"})
    return;
  }

  try {
    res.status(200).json(await service.createInstitucion(admin, institucion))
  } catch (error) {
    res.status(409).json({ error: error.message })
  }
  return;
}

const deleteInstitucion = async (req, res) => {
  const { params: { id_institucion } } = req
  
  if (isNaN(id_institucion)) {
    res.status(400).json({ error: "Parameter ':id_institucion' should be a number"})
    return ;
  }
  
  try {
    res.status(200).json(await service.deleteInstitucion(id_institucion))
  } catch (error) {
    res.status(500).json({ error: `Error al eliminar la institucion con id ${id_institucion}` })
  }
  return;
}

const getAllRoles = async (req, res) => {
  try {
    res.status(200).json(await service.getAllRoles())
  } catch (error) {
    res.status(500).json({ error: `Error al obtener los roles` })
  }
}

module.exports = {
  getOneInstitucion,
  getAllInstituciones,
  createInstitucion,
  deleteInstitucion,
  getAllRoles
}