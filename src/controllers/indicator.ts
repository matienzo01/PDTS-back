import { Request, Response, NextFunction  } from 'express';
import { CustomError } from '../types/CustomError';
import service from '../services/indicator'
import utils from './utils';

const getAllIndicators = async(req: Request, res: Response) => {
    const {id_instancia, id_dimension} = req.query

    try {
        utils.validateNumberParameter(id_instancia, 'id_instancia')
        utils.validateNumberParameter(id_dimension, 'id_dimension')
        res.status(200).json(await service.getAllIndicators(parseInt(id_instancia as string), parseInt(id_dimension as string)))
    } catch(error) {
        res.status(500).json({ error: 'Error obteniendo los indicadores'})
    }
}

const getOneIndicator = async(req: Request, res: Response, next: NextFunction) => {
    const {params: { id_indicador }} = req

    try {
        utils.validateNumberParameter(id_indicador, 'id_indicador')
        res.status(200).json(await service.getOneIndicator(parseInt(id_indicador)))
    } catch(error) {
        next(error)
    }
}

const createIndicator = async(req: Request, res: Response, next: NextFunction) => {

    if(!req.body.hasOwnProperty('indicador')){
        return res.status(400).json({ error: "Missing indicator"})
    }

    const { indicador } = req.body

    if (
        !indicador.hasOwnProperty('pregunta') ||
        !indicador.hasOwnProperty('fundamentacion') ||
        !indicador.hasOwnProperty('id_dimension') ||
        !indicador.hasOwnProperty('determinante')) {
            res.status(400).json({ error: "Missing fields in indicator"})
            return ;
    }

    try {
        res.status(201).json(await service.createIndicator(indicador))
    } catch (error){
        next(error)
    }
}

const deleteIndicator = async(req: Request, res: Response, next: NextFunction) => {
    const { params: { id_indicador } } = req

    try {
        utils.validateNumberParameter(id_indicador, 'id_indicador')
        res.status(204).json(await service.deleteIndicator(parseInt(id_indicador)))
    } catch (error){
        next(error)
    }
}

const updateIndicator = async(req: Request, res: Response, next: NextFunction) => {
    const { params: { id_indicador } } = req
    const { indicador } = req.body 
    
    try {
        utils.validateNumberParameter(id_indicador, 'id_indicador')
        res.status(200).json(await service.updateIndicator(parseInt(id_indicador), indicador))
    } catch (error){
        next(error)
    }
}

export default {
    getAllIndicators,
    getOneIndicator,
    createIndicator,
    deleteIndicator,
    updateIndicator
}