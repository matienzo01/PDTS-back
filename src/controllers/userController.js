const service = require('../services/userService')
const institutionCytService = require('../services/institutionCYTService')

const getAllUsers = async (req, res) => {
  try {
    res.status(200).json(await service.getAllUsers())
  } catch (error) {
    const statusCode = error.status || 500
    res.status(statusCode).json({ error: error.message })
  }
}

const getAllInstitutionUsers = async (req, res) => {
  const { params: { id_institucion } } = req

  if (isNaN(id_institucion)) {
    res.status(400).json({ error: "Parameter ':id_institucion' should be a number" })
    return ;
  }

  try {
    res.status(200).json(await service.getAllInstitutionUsers(id_institucion))
  } catch (_error) {
    const statusCode = _error.status || 500
    res.status(statusCode).json({ error: _error.message })
  }
}

const getUserByDni = async (req, res) => {
  const { params: { id_institucion, dni } } = req
  if (isNaN(dni)) {
    res.status(400).json({ error: "Parameter ':dni' should be a number" })
    return ;
  }

  try {
    res.status(200).json({ usuario: await service.getUserByDni(dni) })
  } catch (_error) {
    const statusCode = _error.status || 500
    res.status(statusCode).json({ error: _error.message })
  }
}

const linkUserToInstitution = async (req, res) => {
  const { params: { id_institucion } } = req
  const { dni, id_usuario: id_admin, rol } = req.body

  if (isNaN(id_institucion)) {
    return res.status(400).json({ error: "Parameter ':id_institucion' should be a number" })
  }

  if (isNaN(dni)) {
    return res.status(400).json({ error: "Parameter ':dni' should be a number" })
  }

  if(rol !== 'admin general' && await institutionCytService.getInstIdFromAdmin(id_admin) != id_institucion){
    return res.status(403).json({ error: "An admin can only manage his own institution" })
  }

  try {
    res.status(200).json(await service.linkUserToInstitution(dni, id_institucion))
  } catch (error) {
    const statusCode = error.status || 500
    res.status(statusCode).json({ error: error.message })
  }
}

const createUser = async (req, res) => {
  const { params: { id_institucion } } = req
  const { user, id_usuario: id_admin } = req.body

  if (isNaN(id_institucion)) {
    res.status(400).json({ error: "Parameter ':id_institucion' should be a number" })
    return ;
  }

  if(await institutionCytService.getInstIdFromAdmin(id_admin) != id_institucion){
    return res.status(403).json({ error: "An admin can only manage his own institution" })
  }

  if (!user.hasOwnProperty('email') ||
    !user.hasOwnProperty('password') ||
    !user.hasOwnProperty('nombre') ||
    !user.hasOwnProperty('apellido') ||
    !user.hasOwnProperty('dni') ||
    !user.hasOwnProperty('celular') ||
    !user.hasOwnProperty('especialidad') ||
    !user.hasOwnProperty('pais_residencia') ||
    !user.hasOwnProperty('provincia_residencia') ||
    !user.hasOwnProperty('localidad_residencia') ||
    !user.hasOwnProperty('institucion_origen') ) {
      res.status(400).json({ error: "Missing fields in the user" })
      return;
  }

  try {
    res.status(200).json(await service.createUser(user, id_institucion))
  } catch (_error) {
    const statusCode = _error.status || 500
    res.status(statusCode).json({ error: _error.message })
  }
  return;
}

const updateUser = async (req, res) => {
  const { params: { id_usuario } } = req
  const { user } = req.body

  if (isNaN(id_usuario)) {
    res.status(400).json({ error: "Parameter ':id_usuario' should be a number" })
    return ;
  }

  if (id_usuario != req.body.id_usuario){
    res.status(401).json({ error: "you can only update your own user" })
    return ;
  }

  try {
    res.status(200).json(await service.updateUser(id_usuario, user))
  } catch (_error) {
    const statusCode = _error.status || 500
    res.status(statusCode).json({ error: _error.message })
  }
}

module.exports = {
  getAllUsers,
  getAllInstitutionUsers,
  getUserByDni,
  linkUserToInstitution,
  createUser,
  updateUser
}