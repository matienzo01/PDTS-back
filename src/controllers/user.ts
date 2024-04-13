import service from '../services/user'
import institutionCytService from '../services/institutionCYT'
import { Request, Response } from 'express';
import { CustomError } from '../types/CustomError.js';

const getAllUsers = async (req: Request, res: Response) => {
  try {
    res.status(200).json(await service.getAllUsers())
  } catch (error) {
    const statusCode = (error as CustomError).status || 500
    res.status(statusCode).json({ error: (error as CustomError).message })
  }
}

const getAllInstitutionUsers = async (req: Request, res: Response) => {
  const { params: { id_institucion } } = req
  const { id: id_admin, rol } = req.body.userData

  if (isNaN(parseInt(id_institucion))) {
    return res.status(400).json({ error: "Parameter ':id_institucion' should be a number" })
  }

  if(rol !== 'admin general' && await institutionCytService.getInstIdFromAdmin(id_admin) != id_institucion){
    return res.status(403).json({ error: "An admin can only manage his own institution" })
  }

  try {
    res.status(200).json(await service.getAllInstitutionUsers(parseInt(id_institucion)))
  } catch (error) {
    const statusCode = (error as CustomError).status || 500
    res.status(statusCode).json({ error: (error as CustomError).message })
  }
}

const getUserByDni = async (req: Request, res: Response) => {
  const { params: { id_institucion, dni } } = req
  if (isNaN(parseInt(dni))) {
    res.status(400).json({ error: "Parameter ':dni' should be a number" })
    return ;
  }

  try {
    res.status(200).json({ usuario: await service.getUserByDni(parseInt(dni)) })
  } catch (error) {
    const statusCode = (error as CustomError).status || 500
    res.status(statusCode).json({ error: (error as CustomError).message })
  }
}

const linkUserToInstitution = async (req: Request, res: Response) => {
  const { params: { id_institucion } } = req  
  const { dni } = req.body
  const { id: id_admin, rol } = req.body.userData

  if (isNaN(parseInt(id_institucion))) {
    return res.status(400).json({ error: "Parameter ':id_institucion' should be a number" })
  }

  if (isNaN(dni)) {
    return res.status(400).json({ error: "Parameter ':dni' should be a number" })
  }

  if(rol !== 'admin general' && await institutionCytService.getInstIdFromAdmin(id_admin) != id_institucion){
    return res.status(403).json({ error: "An admin can only manage his own institution" })
  }

  try {
    res.status(200).json(await service.linkUserToInstitution(dni, parseInt(id_institucion)))
  } catch (error) {
    const statusCode = (error as CustomError).status || 500
    res.status(statusCode).json({ error: (error as CustomError).message })
  }
}

const createUser = async (req: Request, res: Response) => {
  const { params: { id_institucion } } = req
  const { user } = req.body
  const { id: id_admin } = req.body.userData

  if (isNaN(parseInt(id_institucion))) {
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
    res.status(200).json(await service.createUser(user, parseInt(id_institucion)))
  } catch (error) {
    const statusCode = (error as CustomError).status || 500
    res.status(statusCode).json({ error: (error as CustomError).message })
  }
  return;
}

const updateUser = async (req: Request, res: Response) => {
  const { params: { id_usuario } } = req
  const { user } = req.body

  if (isNaN(parseInt(id_usuario))) {
    res.status(400).json({ error: "Parameter ':id_usuario' should be a number" })
    return ;
  }

  if (id_usuario != req.body.id_usuario){
    res.status(401).json({ error: "you can only update your own user" })
    return ;
  }

  try {
    res.status(200).json(await service.updateUser(parseInt(id_usuario), user))
  } catch (error) {
    const statusCode = (error as CustomError).status || 500
    res.status(statusCode).json({ error: (error as CustomError).message })
  }
}

export default {
  getAllUsers,
  getAllInstitutionUsers,
  getUserByDni,
  linkUserToInstitution,
  createUser,
  updateUser
}