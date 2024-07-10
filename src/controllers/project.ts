import service from '../services/project';
import institutionCytService from '../services/institutionCYT';
import { Request, Response, NextFunction  } from 'express';
import utils from './utils';


const getAllProjects = async(req: Request, res: Response) => {
  try {
    res.status(200).json(await service.getAllProjects())
  } catch (error) {
    res.status(500).json({ error: 'Error obteniendo los proyectos'})
  }
}

const getAllInstitutionProjects = async (req: Request, res: Response) => {
  const { params: { id_institucion } } = req

  try {
    utils.validateNumberParameter(id_institucion, 'id_institucion')
    res.status(200).json(await service.getAllInstitutionProjects(parseInt(id_institucion)))
  } catch (error) {
    res.status(500).json({ error: 'error getting the institution projects' })
  }
}

const getOneProject = async (req: Request, res: Response, next: NextFunction) => {
  const { params: { id_institucion, id_proyecto } } = req

  try {
    utils.validateNumberParameter(id_institucion, 'id_institucion')
    utils.validateNumberParameter(id_proyecto, 'id_proyecto')
    const { proyecto } = await service.getOneProject(parseInt(id_proyecto), parseInt(id_institucion))
    proyecto.director = await service.getDirector(proyecto)
    res.status(200).json(proyecto)
  } catch (error) {
    next(error)
  }
}

const createProject = async (req: Request, res: Response, next: NextFunction) => {
  const { params: { id_institucion } } = req
  const proyecto = JSON.parse(req.body.proyecto)
  const { id: id_admin } = req.body.userData

  if(!req.file) {
    return res.status(400).json({error: 'No se subio ningun archivo'})
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
    !proyecto.hasOwnProperty("relevancia") ||
    !proyecto.hasOwnProperty("pertinencia") ||
    !proyecto.hasOwnProperty("demanda") ||
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

  try {
    utils.validateNumberParameter(id_institucion, 'id_institucion')
    await utils.ownInstitution('admin', id_admin, parseInt(id_institucion))
    utils.checRolesInstituciones(proyecto.roles)
    const roles = proyecto.roles
    delete proyecto.roles
    res.status(200).json(await service.createProject(parseInt(id_institucion), proyecto, roles))
  } catch (error) {
    next(error)
  }
}

const deleteProject = async (req: Request, res: Response, next: NextFunction) => {
  const { params: { id_institucion, id_proyecto } } = req

  try {
    utils.validateNumberParameter(id_institucion, 'id_institucion')
    utils.validateNumberParameter(id_proyecto, 'id_proyecto')
    res.status(204).json(await service.deleteProject(parseInt(id_institucion), parseInt(id_proyecto)))
  } catch (error) {
    next(error)
  }
}

const assignEvaluador = async (req: Request, res: Response, next: NextFunction) => {
  const { params: { id_institucion, id_proyecto } } = req
  const { id_evaluador} = req.body
  const { id: id_admin } = req.body.userData

  try {
    utils.validateNumberParameter(id_institucion, 'id_institucion')
    utils.validateNumberParameter(id_proyecto, 'id_proyecto')
    utils.validateNumberParameter(id_evaluador, 'id_evaluador')
    await utils.ownInstitution('admin', id_admin, parseInt(id_institucion))

    const fecha = new Date()
    const data = {
      id_evaluador: id_evaluador,
      id_proyecto: id_proyecto,
      fecha_inicio_eval: `${fecha.getFullYear()}-${fecha.getMonth() + 1}-${fecha.getDate()}`,
      rol: 'evaluador'
    }

    return res.status(201).json(await service.assignEvaluador(data, parseInt(id_institucion)))
  } catch (error) {
    next(error)
  }

}

const getParticipants = async (req: Request, res: Response, next: NextFunction) => {
  const { params: { id_institucion, id_proyecto } } = req

  try {
    utils.validateNumberParameter(id_institucion, 'id_institucion')
    utils.validateNumberParameter(id_proyecto, 'id_proyecto')
    await institutionCytService.getOneInstitucionCYT(parseInt(id_institucion))
    res.status(200).json({ participantes: await service.getParticipants(parseInt(id_proyecto)) })
  } catch (error) {
    next(error)
  }
}

const unassignEvaluador = async (req: Request, res: Response, next: NextFunction) => {
  const { params: { id_institucion, id_proyecto, id_evaluador } } = req
  const { id: id_admin } = req.body.userData

  try {
    utils.validateNumberParameter(id_institucion, 'id_institucion')
    utils.validateNumberParameter(id_proyecto, 'id_proyecto')
    utils.validateNumberParameter(id_evaluador, 'id_evaluador')
    await utils.ownInstitution('admin', id_admin, parseInt(id_institucion))
    res.status(204).json(await service.unassignEvaluador(parseInt(id_evaluador), parseInt(id_proyecto)))
  } catch (error) {
    next(error)
  }
}

const getProjectsByUser = async (req: Request, res: Response, next: NextFunction) => {
  const { params: { id_usuario } } = req

  try {
    utils.validateNumberParameter(id_usuario, 'id_usuario')
    res.status(200).json(await service.getProjectsByUser(parseInt(id_usuario)))
  } catch (error) {
    next(error)
  }
}

const updateProject = async (req: Request, res: Response, next: NextFunction) => {
  const { params: { id_institucion, id_proyecto } } = req
  const { proyecto, userData } = req.body

  try {
    utils.validateNumberParameter(id_institucion, 'id_institucion')
    utils.validateNumberParameter(id_proyecto, 'id_proyecto')
    await utils.ownInstitution(userData.rol, userData.id, parseInt(id_institucion))
    utils.checRolesInstituciones(proyecto.roles)
    res.status(200).json(await service.updateProject(proyecto, parseInt(id_proyecto)))
  } catch (error) {
    next(error)
  }
}

export default {
  getAllInstitutionProjects,
  getAllProjects,
  getOneProject,
  createProject,
  deleteProject,
  assignEvaluador,
  unassignEvaluador,
  getParticipants,
  getProjectsByUser,
  updateProject
}