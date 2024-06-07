import service from '../services/institutionCYT';
import { Request, Response } from 'express';
import { CustomError } from '../types/CustomError';

const getOneInstitucionCYT = async (req: Request, res: Response) => {
  const { params: { id_institucion } } = req

  if (isNaN(parseInt(id_institucion))) {
    return res.status(400).json({ error: "Parameter ':id_institucion' should be a number" })
  }

  try {
    return res.status(200).json(await service.getOneInstitucionCYT(parseInt(id_institucion)))
  } catch (error) {
    const statusCode = (error as CustomError).status || 500
    return res.status(statusCode).json({ error: (error as CustomError).message })
  }
}

const getAllInstitucionesCYT = async (req: Request, res: Response) => {
  try {
    return res.status(200).json(await service.getAllInstitucionesCYT())
  } catch (error) {
    return res.status(500).json({ error: 'Error al obtener las instituciones' })
  }
}

const getTiposInstituciones = async (req: Request, res: Response) => {
  try {
    return res.status(200).json(await service.getTiposInstituciones())
  } catch (error) {
    return res.status(500).json({ error: 'Error al obtener los tipos de instituciones' })
  }
}

const createInstitucionCYT = async (req: Request, res: Response) => {

  if(!req.body.hasOwnProperty('admin')) {
    return res.status(400).json({ error: "Missing admin" })
  }

  if(!req.body.hasOwnProperty('institucion')) {
    return res.status(400).json({ error: "Missing admin" })
  }

  const { admin, institucion } = req.body

  if (!admin.nombre ||
    !admin.apellido ||
    !admin.email ||
    !admin.dni) {
      return res.status(400).json({ error: "Missing fields in the admin" })
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
      return res.status(400).json({ error: "Missing fields in the institucion" })
  }

  try {
    return res.status(200).json(await service.createInstitucionCYT(admin, institucion))
  } catch (error) {
    return res.status(409).json({ error: (error as CustomError).message })
  }
}

const deleteInstitucionCYT = async (req: Request, res: Response) => {
  const { params: { id_institucion } } = req

  if (isNaN(parseInt(id_institucion))) {
    return res.status(400).json({ error: "Parameter ':id_institucion' should be a number" })
  }

  try {
    await service.deleteInstitucionCYT(parseInt(id_institucion))
    return res.status(200).json("Institucion eliminada exitosamente")
  } catch (error) {
    const statusCode = (error as CustomError).status || 500
    res.status(statusCode).json({ error: (error as CustomError).message })
  }
}

export default {
  getOneInstitucionCYT,
  getAllInstitucionesCYT,
  createInstitucionCYT,
  deleteInstitucionCYT,
  getTiposInstituciones
}