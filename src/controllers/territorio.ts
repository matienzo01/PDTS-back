import { Request, Response } from 'express';
import { CustomError } from '../types/CustomError';
import service from '../services/territorio'

const getPaises = async(req: Request, res: Response) => {
    try {
        res.status(200).json(await service.getPaises())
    } catch (error) {
        const statusCode = (error as CustomError).status || 500
        res.status(statusCode).json({ error: (error as CustomError).message})
    }
}

const getProvincias = async(req: Request, res: Response) => {
    try {
        res.status(200).json(await service.getProvincias())
    } catch (error) {
        const statusCode = (error as CustomError).status || 500
        res.status(statusCode).json({ error: (error as CustomError).message})
    }
}

const getAllLocalidades = async(req: Request, res: Response) => {
    try {
        res.status(200).json(await service.getAllLocalidades())
    } catch (error) {
        const statusCode = (error as CustomError).status || 500
        res.status(statusCode).json({ error: (error as CustomError).message})
    }
}

const getLocalidades = async(req: Request, res: Response) => {
    const { params: { id_provincia } } = req
    try {
        res.status(200).json(await service.getLocalidades(parseInt(id_provincia)))
    } catch (error) {
        const statusCode = (error as CustomError).status || 500
        res.status(statusCode).json({ error: (error as CustomError).message})
    }
}

export default {
    getAllLocalidades,
    getLocalidades,
    getPaises,
    getProvincias
}