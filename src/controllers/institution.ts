import service from '../services/institution'
import { Request, Response } from 'express';
import { CustomError } from '../types/CustomError';

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
    !institucion.hasOwnProperty('rubro') ||
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

export default {
  getInstituciones,
  getOneInstitucion,
  createInstitucion
}