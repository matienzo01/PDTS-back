import { Request, Response, NextFunction  } from 'express';
import service from '../services/dimension'
import utils from './utils';

const getAllDimensions = async (req: Request, res: Response) => {
    try {
        res.status(200).json(await service.getAllDimensions())
    } catch(error){
        res.status(500).json({ error: 'Error obteniendo las dimensiones'})
    }
}

const getOneDimension = async (req: Request, res: Response, next: NextFunction) => {
    const { params: { id_dimension }} = req

    try {
        utils.validateNumberParameter(id_dimension,'id_dimension')
        res.status(200).json(await service.getOneDimension(parseInt(id_dimension)))
    } catch (error) {
        next(error)
    }
}

const createDimension = async (req: Request, res: Response, next: NextFunction) => {
    const { dimension } = req.body

    if (
        !dimension.nombre ||
        !dimension.id_instancia) {
            return res.status(400).json({ error: "Campos faltantes en la peticion"})
    }

    try {
        res.status(201).json( await service.createDimension(dimension))
    } catch(error) {
        next(error)
    }
}

const deleteDimension = async (req: Request, res: Response, next: NextFunction) => {
    const { params: { id_dimension } } = req

    try {
        utils.validateNumberParameter(id_dimension,'id_dimension')
        res.status(204).json(await service.deleteDimension(parseInt(id_dimension)))
    } catch (error) {
        next(error)
    }
}

const updateDimension = async (req: Request, res: Response, next: NextFunction) => {
    const { params: { id_dimension } } = req
    const { dimension } = req.body
    
    try {
        utils.validateNumberParameter(id_dimension,'id_dimension')
        res.status(200).json(await service.updateDimension(parseInt(id_dimension), dimension))
    } catch (error) {
        next(error)
    }
}

export default {
    getAllDimensions,
    getOneDimension,
    createDimension,
    deleteDimension,
    updateDimension
}