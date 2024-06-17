import service from '../services/institution'
import { Request, Response } from 'express';
import { CustomError } from '../types/CustomError';

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
    const statusCode = (error as CustomError).status || 500
    res.status(statusCode).json({ error: (error as CustomError).message })
  }
}

const createRubro = async (req: Request, res: Response) => {
  const { nombre } = req.body

  try {
    return res.status(200).json(await service.createRubro(nombre))
  } catch (error) {
    const statusCode = (error as CustomError).status || 500
    res.status(statusCode).json({ error: (error as CustomError).message })
  }
}

const updateRubro = async(req: Request, res: Response) => {
  const { params: { id_rubro} } = req
  const { updatedRubro } = req.body

  try {
    return res.status(200).json(await service.updateRubro(parseInt(id_rubro), updatedRubro))
  } catch (error) {
    const statusCode = (error as CustomError).status || 500
    res.status(statusCode).json({ error: (error as CustomError).message })
  }
}

const deleteRubro = async(req: Request, res: Response) => {
  const { params: { id_rubro} } = req

  try {
    return res.status(200).json(await service.deleteRubro(parseInt(id_rubro)))
  } catch (error) {
    const statusCode = (error as CustomError).status || 500
    res.status(statusCode).json({ error: (error as CustomError).message })
  }
}

const getInstituciones = async (req: Request, res: Response) => {
  try {
    res.status(200).json(await service.getInstituciones())
  } catch (error) {
    const statusCode = (error as CustomError).status || 500
    res.status(statusCode).json({ error: (error as CustomError).message })
  }
}

const getOneInstitucion = async(req: Request, res: Response) => {
  const { params: { inst_id } } = req

  if (isNaN(parseInt(inst_id))) {
    return res.status(400).json({ error: "Parameter ':inst_id' should be a number" })
  }

  try {
    res.status(200).json(await service.getOneInstitucion(parseInt(inst_id)))
  } catch (error) {
    const statusCode = (error as CustomError).status || 500
    res.status(statusCode).json({ error: (error as CustomError).message })
  }
}

const createInstitucion = async(req: Request, res: Response) => {

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
    const statusCode = (error as CustomError).status || 500
    res.status(statusCode).json({ error: (error as CustomError).message })
  }
}

const updateInstitucion = async(req: Request, res: Response) => {
  const { params: { inst_id} } = req
  const { institucion } = req.body

  try {
    return res.status(200).json(await service.updateInstitucion(parseInt(inst_id), institucion))
  } catch (error) {
    const statusCode = (error as CustomError).status || 500
    res.status(statusCode).json({ error: (error as CustomError).message })
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
  deleteRubro
}