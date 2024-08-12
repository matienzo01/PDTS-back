import service from '../services/modelosEncuesta';
import { Request, Response, NextFunction  } from 'express';
import utils from './utils';

const getAllOptions = async(req: Request, res: Response, next: NextFunction) => {
    try {
        res.status(200).json(await service.getAllOptions())
    } catch(error) {
        next(error)
    }
}

const getAllModelos = async(req: Request, res: Response, next: NextFunction) => {
    try {
        res.status(200).json(await service.getAllModelos())
    } catch(error) {
        next(error)
    }
}

const getOneModelo = async(req: Request, res: Response, next: NextFunction) => {
    const { params: {id_modelo} } = req

    try {
        utils.validateNumberParameter(id_modelo,'id_modelo')
        res.status(200).json(await service.getOneModelo(parseInt(id_modelo)))
    } catch(error) {
        next(error)
    }
}

const getAllSecciones = async(req: Request, res: Response, next: NextFunction) => {
    try {
        res.status(200).json(await service.getAllSecciones())
    } catch(error) {
        next(error)
    }
}

const getOneSeccion = async(req: Request, res: Response, next: NextFunction) => {
    const { params: {id_seccion} } = req

    try {
        utils.validateNumberParameter(id_seccion, 'id_seccion')
        res.status(200).json(await service.getOneSeccion(parseInt(id_seccion)))
    } catch(error) {
        next(error)
    }
}

const createSeccion = async(req: Request, res: Response, next: NextFunction) => {
    const { seccion } = req.body

    try {
        res.status(200).json(await service.createSeccion(seccion))
    } catch(error) {
        next(error)
    }
}

const deleteSeccion = async(req: Request, res: Response, next: NextFunction) => {
    const { params: {id_seccion} } = req

    try {
        utils.validateNumberParameter(id_seccion, 'id_seccion')
        res.status(200).json(await service.deleteSeccion(parseInt(id_seccion)))
    } catch(error) {
        next(error)
    }
}

export default {
    getAllOptions,
    getAllModelos,
    getOneModelo,
    getOneSeccion,
    createSeccion,
    getAllSecciones,
    deleteSeccion
  }