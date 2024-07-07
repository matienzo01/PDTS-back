import service from '../services/section'
import { Request, Response, NextFunction  } from 'express';
import utils from './utils';

const getAllSecciones = async (req: Request, res: Response) => {
    try {
        res.status(200).json(await service.getAllSecciones())
    } catch(error){
        res.status(500).json({ error: 'Error obteniendo las secciones'})
    }
}

const getOneSeccion = async (req: Request, res: Response, next: NextFunction) => {
    const { params: { id_seccion }} = req

    try {
        utils.validateNumberParameter(id_seccion, 'id_seccion')
        res.status(200).json(await service.getOneSeccion(parseInt(id_seccion)))
    } catch (error) {
        next(error)
    }
}

const createSeccion = async (req: Request, res: Response, next: NextFunction) => {
    const { seccion } = req.body

    if (!seccion.nombre) {
        res.status(400).json({ error: "Missing fields"})
        return ;
    }

    try {
        res.status(201).json( await service.createSeccion(seccion))
    } catch(error) {
        next(error)
    }
}

const deleteSeccion = async (req: Request, res: Response, next: NextFunction) => {
    const { params: { id_seccion } } = req

    try {
        utils.validateNumberParameter(id_seccion, 'id_seccion')
        res.status(204).json(await service.deleteSeccion(parseInt(id_seccion)))
    } catch (error) {
        next(error)
    }
}

const updateSeccion = async (req: Request, res: Response, next: NextFunction) => {
    const { params: { id_seccion } } = req
    const { seccion } = req.body

    try {
        utils.validateNumberParameter(id_seccion, 'id_seccion')
        res.status(200).json(await service.updateSeccion(parseInt(id_seccion), seccion))
    } catch (error) {
        next(error)
    }
}

export default {
    getAllSecciones,
    getOneSeccion,
    createSeccion,
    deleteSeccion,
    updateSeccion
}