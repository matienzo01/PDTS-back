const service = require('../services/projectService')
const institutionCytService = require('../services/institutionCYTService')

// va a haber que modificarlo para que:
//- Sos admin general -> te devolvemos todos los proyectos
//- Sos admin CyT -> los de tu institucion
//- Sos eval -> a los que estás asignado
const getAllProjects = async (req, res) => {
  const { params: { id_institucion } } = req

  if (isNaN(id_institucion)) {
    res.status(400).json({ error: "Parameter ':id_institucion' should be a number" })
    return ;
  }

  try {
    res.status(200).json(await service.getAllProjects(id_institucion))
  } catch (error) {
    const statusCode = error.status || 500
    res.status(statusCode).json({ error: error.message })
  }
}

const getOneProject = async (req, res) => {
  const { params: { id_institucion, id_proyecto } } = req

  if (isNaN(id_institucion)) {
    res.status(400).json({ error: "Parameter ':id_institucion' should be a number" })
    return ;
  }

  if (isNaN(id_proyecto)) {
    res.status(400).json({ error: "Parameter ':id_proyecto' should be a number" })
    return ;
  }

  try {
    res.status(200).json(await service.getOneProject(id_proyecto, id_institucion))
  } catch (_error) {
    const statusCode = _error.status || 500
    res.status(statusCode).json({ error: _error.message })
  }
}

const createProject = async (req, res) => {
  const { params: { id_institucion } } = req
  const { proyecto, id_usuario: id_admin } = req.body

  if (isNaN(id_institucion)) {
    res.status(400).json({ error: "Parameter ':id_institucion' should be a number" })
    return ;
  }

  if (!proyecto.titulo ||
    !proyecto.id_director ||
    !proyecto.FechaInicio ||
    !proyecto.FechaFin ||
    !proyecto.area_conocim ||
    !proyecto.subarea_conocim ||
    !proyecto.problema_a_resolver ||
    !proyecto.producto_a_generar ||
    !proyecto.resumen ||
    !proyecto.novedad_u_originalidad ||
    !proyecto.grado_relevancia ||
    !proyecto.grado_pertinencia ||
    !proyecto.grado_demanda ||
    !proyecto.hasOwnProperty('obligatoriedad_proposito') ||
    !proyecto.roles) {

    res.status(400).send({
      status: 'FAILED',
      data: { error: "Missing fields" }
    })
    return;
  }

  if(await institutionCytService.getInstIdFromAdmin(id_admin) != id_institucion){
    return res.status(403).json({ error: "An admin can only manage his own institution" })
  }

  try {
    const roles = proyecto.roles
    delete proyecto.roles
    res.status(200).json(await service.createProject(id_institucion, proyecto, roles, id_admin))
  } catch (error) {
    const statusCode = error.status || 500
    res.status(statusCode).json({ error: error.message })
  }
  return;
}

const deleteProject = async (req, res) => {
  const { params: { id_institucion, id_proyecto } } = req

  if (isNaN(id_institucion)) {
    res.status(400).json({ error: "Parameter ':id_institucion' should be a number" })
    return ;
  }

  if (isNaN(id_proyecto)) {
    res.status(400).json({ error: "Parameter ':id_proyecto' should be a number" })
    return ;
  }

  try {
    res.status(204).json(await service.deleteProject(id_institucion, id_proyecto))
  } catch (error) {
    const statusCode = error.status || 500
    res.status(statusCode).json({ error: error.message })
  }
  return;

}

const assignEvaluador = async (req, res) => {
  const { params: { id_institucion, id_proyecto } } = req
  const { id_evaluador, obligatoriedad_opinion, id_modelo_encuesta, id_usuario: id_admin} = req.body

  if ( obligatoriedad_opinion === undefined || id_modelo_encuesta === undefined) {
    return res.status(400).json({ error: "Missing fields"})
  }

  if (isNaN(id_institucion)) {
    res.status(400).json({ error: "Parameter ':id_institucion' should be a number" })
    return ;
  }

  if (isNaN(id_proyecto)) {
    res.status(400).json({ error: "Parameter ':id_proyecto' should be a number" })
    return ;
  }

  if (isNaN(id_evaluador)) {
    res.status(400).json({ error: "Parameter ':id_evaluador' should be a number" })
    return ;
  }

  if(await institutionCytService.getInstIdFromAdmin(id_admin) != id_institucion){
    return res.status(403).json({ error: "An admin can only manage his own institution" })
  }

  const fecha = new Date()
  const data = {
    id_evaluador: id_evaluador,
    id_proyecto: id_proyecto,
    fecha_inicio_eval: `${fecha.getFullYear()}-${fecha.getMonth() + 1}-${fecha.getDate()}`,
    rol: 'evaluador',
    obligatoriedad_opinion: obligatoriedad_opinion,
    id_modelo_encuesta: id_modelo_encuesta
  }

  try {
    res.status(201).json(await service.assignEvaluador(data, id_institucion))
  } catch (error) {
    const statusCode = error.status || 500
    res.status(statusCode).json({ error: error.message })
  }

}

const getParticipants = async (req, res) => {
  const { params: { id_institucion, id_proyecto } } = req

  if (isNaN(id_institucion)) {
    return res.status(400).json({ error: "Parameter ':id_institucion' should be a number" })
  }

  if (isNaN(id_proyecto)) {
    return res.status(400).json({ error: "Parameter ':id_proyecto' should be a number" })
  }

  try {
    await institutionCytService.getOneInstitucionCYT(id_institucion)
    res.status(200).json({ participantes: await service.getParticipants(id_proyecto) })
  } catch (error) {
    const statusCode = error.status || 500
    res.status(statusCode).json({ error: error.message })
  }
}

const unassignEvaluador = async (req, res) => {
  const { params: { id_institucion, id_proyecto, id_evaluador } } = req
  const { id_usuario: id_admin } = req.body

  if (isNaN(id_institucion)) {
    res.status(400).json({ error: "Parameter ':id_institucion' should be a number" })
    return ;
  }

  if (isNaN(id_proyecto)) {
    res.status(400).json({ error: "Parameter ':id_proyecto' should be a number" })
    return ;
  }

  if (isNaN(id_evaluador)) {
    res.status(400).json({ error: "Parameter ':id_evaluador' should be a number" })
    return ;
  }

  if(await institutionCytService.getInstIdFromAdmin(id_admin) != id_institucion){
    return res.status(403).json({ error: "An admin can only manage his own institution" })
  }

  try {
    res.status(204).json(await service.unassignEvaluador(id_evaluador, id_proyecto))
  } catch (error) {
    const statusCode = error.status || 500
    res.status(statusCode).json({ error: error.message })
  }
}

const getProjectsByUser = async (req, res) => {
  const { params: { id_usuario } } = req

  if (isNaN(id_usuario)) {
    return res.status(400).json({ error: "Parameter ':id_usuario' should be a number" })
    return ;
  }

  try {
    res.status(200).json(await service.getProjectsByUser(id_usuario))
  } catch (error) {
    const statusCode = error.status || 500
    res.status(statusCode).json({ error: error.message })
  }
}

module.exports = {
  getAllProjects,
  getOneProject,
  createProject,
  deleteProject,
  assignEvaluador,
  unassignEvaluador,
  getParticipants,
  getProjectsByUser
}