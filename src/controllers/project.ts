import service from '../services/project';
import institutionCytService from '../services/institutionCYT';
import { Request, Response } from 'express';
import { CustomError } from '../types/CustomError.js';

// va a haber que modificarlo para que:
//- Sos admin general -> te devolvemos todos los proyectos
//- Sos admin CyT -> los de tu institucion
//- Sos eval -> a los que estás asignado
const getAllProjects = async (req: Request, res: Response) => {
  const { params: { id_institucion } } = req

  if (isNaN(parseInt(id_institucion))) {
    res.status(400).json({ error: "Parameter ':id_institucion' should be a number" })
    return ;
  }

  try {
    res.status(200).json(await service.getAllProjects(parseInt(id_institucion)))
  } catch (error) {
    const statusCode = (error as CustomError).status || 500
    res.status(statusCode).json({ error: (error as CustomError).message })
  }
}

const getOneProject = async (req: Request, res: Response) => {
  const { params: { id_institucion, id_proyecto } } = req

  if (isNaN(parseInt(id_institucion))) {
    res.status(400).json({ error: "Parameter ':id_institucion' should be a number" })
    return ;
  }

  if (isNaN(parseInt(id_proyecto))) {
    res.status(400).json({ error: "Parameter ':id_proyecto' should be a number" })
    return ;
  }

  try {
    res.status(200).json(await service.getOneProject(parseInt(id_proyecto), parseInt(id_institucion)))
  } catch (error) {
    const statusCode = (error as CustomError).status || 500
    res.status(statusCode).json({ error: (error as CustomError).message })
  }
}

const createProject = async (req: Request, res: Response) => {
  const { params: { id_institucion } } = req
  const { proyecto } = req.body
  const { id: id_admin } = req.body.userData

  if (isNaN(parseInt(id_institucion))) {
    res.status(400).json({ error: "Parameter ':id_institucion' should be a number" })
    return ;
  }

  if (!proyecto.hasOwnProperty("titulo") ||
    !proyecto.hasOwnProperty("id_director") ||
    !proyecto.hasOwnProperty("FechaInicio") ||
    !proyecto.hasOwnProperty("FechaFin") ||
    !proyecto.hasOwnProperty("area_conocim") ||
    !proyecto.hasOwnProperty("subarea_conocim") ||
    !proyecto.hasOwnProperty("problema_a_resolver") ||
    !proyecto.hasOwnProperty("producto_a_generar") ||
    !proyecto.hasOwnProperty("resumen") ||
    !proyecto.hasOwnProperty("novedad_u_originalidad") ||
    !proyecto.hasOwnProperty("grado_relevancia") ||
    !proyecto.hasOwnProperty("grado_pertinencia") ||
    !proyecto.hasOwnProperty("grado_demanda") ||
    !proyecto.hasOwnProperty('obligatoriedad_proposito') ||
    !proyecto.hasOwnProperty('obligatoriedad_opinion') ||
    !proyecto.hasOwnProperty('id_modelo_encuesta') ||
    !proyecto.hasOwnProperty("roles")) {

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
    res.status(200).json(await service.createProject(parseInt(id_institucion), proyecto, roles))
  } catch (error) {
    const statusCode = (error as CustomError).status || 500
    res.status(statusCode).json({ error: (error as CustomError).message })
  }
  return;
}

const deleteProject = async (req: Request, res: Response) => {
  const { params: { id_institucion, id_proyecto } } = req

  if (isNaN(parseInt(id_institucion))) {
    res.status(400).json({ error: "Parameter ':id_institucion' should be a number" })
    return ;
  }

  if (isNaN(parseInt(id_proyecto))) {
    res.status(400).json({ error: "Parameter ':id_proyecto' should be a number" })
    return ;
  }

  try {
    res.status(204).json(await service.deleteProject(parseInt(id_institucion), parseInt(id_proyecto)))
  } catch (error) {
    const statusCode = (error as CustomError).status || 500
    res.status(statusCode).json({ error: (error as CustomError).message })
  }
  return;

}

const assignEvaluador = async (req: Request, res: Response) => {
  const { params: { id_institucion, id_proyecto } } = req
  const { id_evaluador} = req.body
  const { id: id_admin } = req.body.userData

  if (isNaN(parseInt(id_institucion))) {
    res.status(400).json({ error: "Parameter ':id_institucion' should be a number" })
    return ;
  }

  if (isNaN(parseInt(id_proyecto))) {
    res.status(400).json({ error: "Parameter ':id_proyecto' should be a number" })
    return ;
  }

  if (isNaN(parseInt(id_evaluador))) {
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
    rol: 'evaluador'
  }

  try {
    return res.status(201).json(await service.assignEvaluador(data, parseInt(id_institucion)))
  } catch (error) {
    const statusCode = (error as CustomError).status || 500
    return res.status(statusCode).json({ error: (error as CustomError).message })
  }

}

const getParticipants = async (req: Request, res: Response) => {
  const { params: { id_institucion, id_proyecto } } = req

  if (isNaN(parseInt(id_institucion))) {
    return res.status(400).json({ error: "Parameter ':id_institucion' should be a number" })
  }

  if (isNaN(parseInt(id_proyecto))) {
    return res.status(400).json({ error: "Parameter ':id_proyecto' should be a number" })
  }

  try {
    await institutionCytService.getOneInstitucionCYT(parseInt(id_institucion))
    res.status(200).json({ participantes: await service.getParticipants(parseInt(id_proyecto)) })
  } catch (error) {
    const statusCode = (error as CustomError).status || 500
    res.status(statusCode).json({ error: (error as CustomError).message })
  }
}

const unassignEvaluador = async (req: Request, res: Response) => {
  const { params: { id_institucion, id_proyecto, id_evaluador } } = req
  const { id: id_admin } = req.body.userData

  if (isNaN(parseInt(id_institucion))) {
    res.status(400).json({ error: "Parameter ':id_institucion' should be a number" })
    return ;
  }

  if (isNaN(parseInt(id_proyecto))) {
    res.status(400).json({ error: "Parameter ':id_proyecto' should be a number" })
    return ;
  }

  if (isNaN(parseInt(id_evaluador))) {
    res.status(400).json({ error: "Parameter ':id_evaluador' should be a number" })
    return ;
  }

  if(await institutionCytService.getInstIdFromAdmin(id_admin) != id_institucion){
    return res.status(403).json({ error: "An admin can only manage his own institution" })
  }

  try {
    res.status(204).json(await service.unassignEvaluador(parseInt(id_evaluador), parseInt(id_proyecto)))
  } catch (error) {
    const statusCode = (error as CustomError).status || 500
    res.status(statusCode).json({ error: (error as CustomError).message })
  }
}

const getProjectsByUser = async (req: Request, res: Response) => {
  const { params: { id_usuario } } = req

  if (isNaN(parseInt(id_usuario))) {
    return res.status(400).json({ error: "Parameter ':id_usuario' should be a number" })
  }

  try {
    res.status(200).json(await service.getProjectsByUser(parseInt(id_usuario)))
  } catch (error) {
    const statusCode = (error as CustomError).status || 500
    res.status(statusCode).json({ error: (error as CustomError).message })
  }
}

export default {
  getAllProjects,
  getOneProject,
  createProject,
  deleteProject,
  assignEvaluador,
  unassignEvaluador,
  getParticipants,
  getProjectsByUser
}