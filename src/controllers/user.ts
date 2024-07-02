import service from '../services/user'
import institutionCytService from '../services/institutionCYT'
import { Request, Response } from 'express';
import { CustomError } from '../types/CustomError.js';

const getOneAdmin = async(req: Request, res: Response) => {
  const id = parseInt(req.params.id_admin)
  const { userData } = req.body

  if (userData.rol == 'admin' && userData.id != id) {
    return res.status(403).json({ error: "An admin can only obtain his own information" })
  }

  try {
    res.status(200).json(await service.getOneAdmin(id));
  } catch (error) {
    const statusCode = (error as CustomError).status || 500
    res.status(statusCode).json({ error: (error as CustomError).message })
  }

}

const getAllUsers = async (req: Request, res: Response) => {
  const { rol } = req.query

  try {
    let response;
    if (rol === 'evaluadores') {
      response = await service.getAllEvaluadores();
    } else if (rol === 'admins') {
      response = await service.getAllAdmins();
    } else {
      const {evaluadores} = await service.getAllEvaluadores();
      const {administradores} = await service.getAllAdmins();
      response = { evaluadores, administradores };
    }
    res.status(200).json(response);

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

const getAllInstitutionAdmins = async (req: Request, res: Response) => {
  const { params: { id_institucion } } = req
  const { id: id_admin, rol } = req.body.userData

  if (isNaN(parseInt(id_institucion))) {
    return res.status(400).json({ error: "Parameter ':id_institucion' should be a number" })
  }

  if(rol !== 'admin general' && await institutionCytService.getInstIdFromAdmin(id_admin) != id_institucion){
    return res.status(403).json({ error: "An admin can only manage his own institution" })
  }

  try {
    res.status(200).json(await service.getAllInstitutionAdmins(parseInt(id_institucion)))
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

  if (id_usuario != req.body.userData.id){
    res.status(401).json({ error: "you can only update your own user" })
    return ;
  }
  
  try {
    res.status(200).json(await service.updateUser(parseInt(id_usuario), user,'evaluador'))
  } catch (error) {
    const statusCode = (error as CustomError).status || 500
    res.status(statusCode).json({ error: (error as CustomError).message })
  }
}

const updateAdminCYT = async(req: Request, res: Response) => {
  const { params: { id_institucion, id_admin } } = req
  const { admin } = req.body

  if (isNaN(parseInt(id_institucion))) {
    return res.status(400).json({ error: "Parameter ':id_institucion' should be a number" })
  }

  if (id_admin != req.body.userData.id){
    res.status(401).json({ error: "you can only update your own user" })
    return ;
  }

  if (id_institucion != req.body.userData.institutionId){
    res.status(401).json({ error: "You can only update the admin of your own institution" })
    return ;
  }

  try {
    res.status(200).json( await service.updateUser(parseInt(id_admin), admin,'admin'))
   
  } catch (error) {
    const statusCode = (error as CustomError).status || 500
    res.status(statusCode).json({ error: (error as CustomError).message })
  }
}

const createAdminGeneral = async(req: Request, res: Response) => {
  const { newAdmin } = req.body 

  if(!newAdmin.email ||
    !newAdmin.password) {
      res.status(400).json({ error: "Missing fields in the admin" })
      return;
  }

  try {
    res.status(200).json( await service.createAdminGeneral(newAdmin))
   
  } catch (error) {
    const statusCode = (error as CustomError).status || 500
    res.status(statusCode).json({ error: (error as CustomError).message })
  }
}

const deleteAdminGeneral = async(req: Request, res: Response) => {

}

const getAllAdminsGenerales = async(req: Request, res: Response) => {
  try {
    res.status(200).json( await service.getAllAdminsGenerales())
   
  } catch (error) {
    const statusCode = (error as CustomError).status || 500
    res.status(statusCode).json({ error: (error as CustomError).message })
  }
}

const getOneAdminGeneral = async(req: Request, res: Response) => {
  
}

const createAdmin = async(req: Request, res: Response) => {
  const { admin } = req.body 
  const id_institucion = parseInt(req.params.id_institucion)
  const { userData }= req.body

  if(userData.rol != 'admin general' && !await service.adminPerteneceInstitucion(id_institucion, userData.id)) {
    return res.status(403).json({ error: "Unauthorized to create an admin for this institution" })
  }

  if (!admin.nombre ||
    !admin.apellido ||
    !admin.email ||
    !admin.dni) {
      return res.status(400).json({ error: "Missing fields in the admin" })
  }

  try {
    res.status(200).json(await service.createAdmin(id_institucion, admin))
  } catch (error) {
    const statusCode = (error as CustomError).status || 500
    res.status(statusCode).json({ error: (error as CustomError).message })
  }

}

const deleteAdminCyT = async(req: Request, res: Response) => {
  const id_institucion = parseInt(req.params.id_institucion)
  const id_admin = parseInt(req.params.id_admin)
  const { userData }= req.body

  if(userData.rol != 'admin general' && !await service.adminPerteneceInstitucion(id_institucion, userData.id)) {
    return res.status(403).json({ error: "Unauthorized to delete an admin for this institution" })
  }

  try {
    res.status(200).json(await service.deleteAdminCyT(id_institucion, id_admin))
  } catch (error) {
    const statusCode = (error as CustomError).status || 500
    res.status(statusCode).json({ error: (error as CustomError).message })
  }

}

export default {
  getAllUsers,
  getAllInstitutionUsers,
  getAllInstitutionAdmins,
  getAllAdminsGenerales,
  getUserByDni,
  getOneAdmin,
  linkUserToInstitution,
  createUser,
  createAdmin,
  createAdminGeneral,
  updateUser,
  updateAdminCYT,
  deleteAdminGeneral,
  deleteAdminCyT,
  getOneAdminGeneral
}