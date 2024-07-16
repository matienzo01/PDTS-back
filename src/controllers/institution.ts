import service from '../services/institution'
import { Request, Response, NextFunction  } from 'express';
import utils from './utils';

const getTiposInstituciones = async (req: Request, res: Response) => {
  try {
    return res.status(200).json(await service.getTiposInstituciones())
  } catch (error) {
    return res.status(500).json({ error: 'Error al obtener los tipos de instituciones' })
  }
}

const getRubros = async (req: Request, res: Response) => {
  try {
    return res.status(200).json(await service.getRubros())
  } catch (error) {
    return res.status(500).json({ error: 'Error al obtener los rubros' })
  }
}

const createRubro = async (req: Request, res: Response, next: NextFunction) => {
  const { rubro } = req.body

  try {
    return res.status(200).json(await service.createRubro(rubro.nombre))
  } catch (error) {
    next(error)
  }
}

const updateRubro = async(req: Request, res: Response, next: NextFunction) => {
  const { params: { id_rubro} } = req
  const { updatedRubro } = req.body

  try {
    utils.validateNumberParameter(id_rubro, 'id_rubro')
    return res.status(200).json(await service.updateRubro(parseInt(id_rubro), updatedRubro))
  } catch (error) {
    next(error)
  }
}

const deleteRubro = async(req: Request, res: Response, next: NextFunction) => {
  const { params: { id_rubro} } = req

  try {
    utils.validateNumberParameter(id_rubro, 'id_rubro')
    return res.status(200).json(await service.deleteRubro(parseInt(id_rubro)))
  } catch (error) {
    next(error)
  }
}

const getInstituciones = async (req: Request, res: Response, next: NextFunction) => {
  try {
    res.status(200).json(await service.getInstituciones())
  } catch (error) {
    next(error)
  }
}

const getOneInstitucion = async(req: Request, res: Response, next: NextFunction) => {
  const { params: { id_institucion } } = req

  try {
    utils.validateNumberParameter(id_institucion, 'id_institucion')
    res.status(200).json(await service.getOneInstitucion(parseInt(id_institucion)))
  } catch (error) {
    next(error)
  }
}

const createInstitucion = async(req: Request, res: Response, next: NextFunction) => {

  if(!req.body.hasOwnProperty('institucion')){
    return res.status(400).json({ error: "Missing institution" })
  }

  const { institucion } = req.body

  if (
    !institucion.hasOwnProperty('nombre') ||
    !institucion.hasOwnProperty('pais') ||
    !institucion.hasOwnProperty('provincia') ||
    !institucion.hasOwnProperty('localidad') ||
    !institucion.hasOwnProperty('id_rubro') ||
    !institucion.hasOwnProperty('id_tipo') ||
    !institucion.hasOwnProperty('telefono_institucional') ||
    !institucion.hasOwnProperty('mail_institucional') ||
    !institucion.esCyt === undefined) {
    return res.status(400).json({ error: "Missing fields in institution" })
  }

  try {
    res.status(200).json(await service.createInstitucion(institucion))
  } catch (error) {
    next(error)
  }
}

const updateInstitucion = async(req: Request, res: Response, next: NextFunction) => {
  const { params: { id_institucion} } = req
  const { institucion } = req.body

  try {
    utils.validateNumberParameter(id_institucion, 'id_institucion')
    return res.status(200).json(await service.updateInstitucion(parseInt(id_institucion), institucion))
  } catch (error) {
    next(error)
  }
}

const deleteInstitucion = async(req: Request, res: Response, next: NextFunction) => {
  const { params: { id_institucion} } = req

  try {
    utils.validateNumberParameter(id_institucion, 'id_institucion')
    return res.status(200).json(await service.deleteInstitucion(parseInt(id_institucion)))
  } catch (error) {
    next(error)
  }
}

export default {
  getInstituciones,
  getOneInstitucion,
  createInstitucion,
  updateInstitucion,
  getRubros,
  getTiposInstituciones,
  createRubro,
  updateRubro,
  deleteRubro,
  deleteInstitucion
}