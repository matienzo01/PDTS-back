import { NextFunction, Request, Response  } from 'express';
import service from '../services/territorio'
import utils from './utils';

const getPaises = async(req: Request, res: Response) => {
    try {
        res.status(200).json(await service.getPaises())
    } catch (error) {
        res.status(500).json({ error: 'Error obteniendo los paises'})
    }
}

const getProvincias = async(req: Request, res: Response) => {
    try {
        res.status(200).json(await service.getProvincias())
    } catch (error) {
        res.status(500).json({ error: 'Error obteniendo las provincias'})
    }
}

const getAllLocalidades = async(req: Request, res: Response) => {
    try {
        res.status(200).json(await service.getAllLocalidades())
    } catch (error) {
        res.status(500).json({ error: 'Error obteniendo las localidades'})
    }
}

const getLocalidades = async(req: Request, res: Response, next: NextFunction) => {
    const { params: { id_provincia } } = req

    try {
        utils.validateNumberParameter(id_provincia, 'id_provincia')
        res.status(200).json(await service.getLocalidades(parseInt(id_provincia)))
    } catch (error) {
        next(error)
    }
}

export default {
    getAllLocalidades,
    getLocalidades,
    getPaises,
    getProvincias
}