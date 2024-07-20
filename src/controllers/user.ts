import service from '../services/user'
import institutionCytService from '../services/institutionCYT'
import { Request, Response, NextFunction  } from 'express';
import { CustomError } from '../types/CustomError.js';
import utils from './utils';

const getOneAdmin = async(req: Request, res: Response, next: NextFunction) => {
  const id = parseInt(req.params.id_admin)
  const { userData } = req.body
  
  if (userData.rol == 'admin' && userData.id != id) {
    return res.status(403).json({ error: "An admin can only obtain his own information" })
  }

  try {
    res.status(200).json(await service.getOneAdmin(id));
  } catch (error) {
    next(error)
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
    res.status(500).json({ error: 'error getting the users' })
  }
}

const getAllInstitutionUsers = async (req: Request, res: Response, next: NextFunction) => {
  const { params: { id_institucion } } = req
  const { id: id_admin, rol } = req.body.userData

  try {
    utils.validateNumberParameter(id_institucion, 'id_institucion')
    await utils.ownInstitution(rol, id_admin, parseInt(id_institucion))
    res.status(200).json(await service.getAllInstitutionUsers(parseInt(id_institucion)))
  } catch (error) {
    next(error)
  }
}

const getAllInstitutionAdmins = async (req: Request, res: Response, next: NextFunction) => {
  const { params: { id_institucion } } = req
  const { id: id_admin, rol } = req.body.userData

  try {
    utils.validateNumberParameter(id_institucion, 'id_institucion')
    await utils.ownInstitution(rol, id_admin, parseInt(id_institucion))
    res.status(200).json(await service.getAllInstitutionAdmins(parseInt(id_institucion)))
  } catch (error) {
    next(error)
  }
}

const getUserByDni = async (req: Request, res: Response, next: NextFunction) => {
  const { params: { dni } } = req

  try {
    utils.validateNumberParameter(dni, 'dni')
    res.status(200).json({ usuario: await service.getUserByDni(parseInt(dni)) })
  } catch (error) {
    next(error)
  }
}

const linkUserToInstitution = async (req: Request, res: Response, next: NextFunction) => {
  const { params: { id_institucion } } = req  
  const { dni } = req.body
  const { id: id_admin, rol } = req.body.userData

  try {
    utils.validateNumberParameter(id_institucion, 'id_institucion')
    utils.validateNumberParameter(dni, 'dni')
    await utils.ownInstitution(rol, id_admin, parseInt(id_institucion))
    res.status(200).json(await service.linkUserToInstitution(dni, parseInt(id_institucion)))
  } catch (error) {
    next(error)
  }
}

const createUser = async (req: Request, res: Response, next: NextFunction) => {
  const { params: { id_institucion } } = req
  const { user } = req.body
  const { id: id_admin } = req.body.userData

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
    utils.validateNumberParameter(id_institucion, id_institucion)
    await utils.ownInstitution('admin', id_admin, parseInt(id_institucion))
    res.status(200).json(await service.createUser(user, parseInt(id_institucion)))
  } catch (error) {
    next(error)
  }
  return;
}

const updateUser = async (req: Request, res: Response, next: NextFunction) => {
  const { params: { id_usuario } } = req
  const { user } = req.body
  
  try {
    utils.validateNumberParameter(id_usuario, 'id_usuario')
    if(id_usuario != req.body.userData.id) {
      throw new CustomError('Solo puedes actualizar tu propia informacion', 401)
    }
    res.status(200).json(await service.updateUser(parseInt(id_usuario), user,'evaluador'))
  } catch (error) {
    next(error)
  }
}

const updateAdminCYT = async(req: Request, res: Response, next: NextFunction) => {
  const { params: { id_institucion, id_admin } } = req
  const { admin } = req.body

  // PREGUNTAR ESTOS DOS IF
  if (id_admin != req.body.userData.id){
    res.status(401).json({ error: "you can only update your own user" })
    return ;
  }

  if (id_institucion != req.body.userData.institutionId){
    res.status(401).json({ error: "You can only update the admin of your own institution" })
    return ;
  }

  try {
    utils.validateNumberParameter(id_institucion, 'id_institucion')
    res.status(200).json( await service.updateUser(parseInt(id_admin), admin,'admin'))
  } catch (error) {
    next(error)
  }
}

const createAdminGeneral = async(req: Request, res: Response, next: NextFunction) => {
  const { newAdmin } = req.body 

  if(!newAdmin.email ||
    !newAdmin.password) {
      res.status(400).json({ error: "Missing fields in the admin" })
      return;
  }

  try {
    res.status(200).json( await service.createAdminGeneral(newAdmin))
  } catch (error) {
    next(error)
  }
}

const deleteAdminGeneral = async(req: Request, res: Response, next: NextFunction) => {

}

const getAllAdminsGenerales = async(req: Request, res: Response) => {
  try {
    res.status(200).json( await service.getAllAdminsGenerales())
  } catch (error) {
    res.status(500).json({ error: 'Error obteniendo los administradores' })
  }
}

const getOneAdminGeneral = async(req: Request, res: Response, next: NextFunction) => {
  
}

const createAdmin = async(req: Request, res: Response, next: NextFunction) => {
  const { admin } = req.body 
  const { params: { id_institucion } } = req
  const { id: id_admin, rol } = req.body.userData

  if (!admin.nombre ||
    !admin.apellido ||
    !admin.email ||
    !admin.dni) {
      return res.status(400).json({ error: "Missing fields in the admin" })
  }

  try {
    utils.validateNumberParameter(id_institucion, 'id_institucion')
    await utils.ownInstitution(rol, id_admin, parseInt(id_institucion))
    res.status(200).json(await service.createAdmin(parseInt(id_institucion), admin))
  } catch (error) {
    next(error)
  }

}

const deleteAdminCyT = async(req: Request, res: Response, next: NextFunction) => {
  const { params: { id_institucion } } = req
  const { id: id_admin, rol } = req.body.userData

  try {
    utils.validateNumberParameter(id_institucion, 'id_institucion')
    await utils.ownInstitution(rol, id_admin, parseInt(id_institucion))
    res.status(200).json(await service.deleteAdminCyT(parseInt(id_institucion), id_admin))
  } catch (error) {
    next(error)
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