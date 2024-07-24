import service from '../services/eval';
import { Request, Response, NextFunction  } from 'express';
import utils from './utils';

const getEntidad = async(req: Request, res: Response, next: NextFunction) => {
  const { params: { id_proyecto } } = req
  const { id:id_usuario, rol } = req.body.userData

  try {
    utils.validateNumberParameter(id_proyecto, 'id_proyecto')
    utils.validateNumberParameter(id_usuario, 'id_usuario')
    const Entidad = await service.getEntidad(parseInt(id_proyecto), parseInt(id_usuario), rol)
    return res.status(200).json(Entidad)
  } catch(error) {
    next(error)
  }
}

const getProposito = async(req: Request, res: Response, next: NextFunction) => {
  const { params: { id_proyecto } } = req
  const { id:id_usuario, rol } = req.body.userData

  try {
    utils.validateNumberParameter(id_proyecto, 'id_proyecto')
    utils.validateNumberParameter(id_usuario, 'id_usuario')
    const Proposito = await service.getProposito(parseInt(id_proyecto), parseInt(id_usuario), rol)
    res.status(200).json(Proposito)
  } catch(error) {
    next(error)
  }
  
}

const saveForm = async(req: Request, res: Response, next: NextFunction) => {
  const { params: { id_proyecto } } = req
  const { id:id_usuario } = req.body.userData
  const { respuestas } = req.body

  try {
    utils.validateNumberParameter(id_proyecto, 'id_proyecto')
    utils.validateNumberParameter(id_usuario, 'id_usuario')
    res.status(200).json(await service.saveForm(parseInt(id_proyecto), parseInt(id_usuario), respuestas))
  } catch(error) {
    next(error)
  }
  
}

const finalizarEvaluacion = async(req: Request, res: Response, next: NextFunction) => {
  const { params: { id_proyecto } } = req
  const { id:id_usuario, rol } = req.body.userData

  try {
    utils.validateNumberParameter(id_proyecto, 'id_proyecto')
    res.status(200).json(await service.finalizarEvaluacion(parseInt(id_proyecto), parseInt(id_usuario), rol))
  } catch(error) {
    next(error)
  }
}

const getResumen = async(req: Request, res: Response, next: NextFunction) => {
  const { params: { id_proyecto } } = req
  const { rol, institutionId } = req.body.userData

  try {
    utils.validateNumberParameter(id_proyecto, 'id_proyecto')
    res.status(200).json(await service.getResumen(rol, parseInt(id_proyecto), institutionId))
  } catch(error) {
    next(error)
  }
}



export default {
  getEntidad,
  getProposito,
  saveForm,
  getResumen,
  finalizarEvaluacion
}