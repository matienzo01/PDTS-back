import { Request, Response } from 'express';
import { CustomError } from '../types/CustomError';
import service from '../services/dimension'

const getAllDimensions = async (req: Request, res: Response) => {
    const { id_instancia } = req.query
    
    if ( id_instancia != '' && (id_instancia === undefined || isNaN(parseInt(id_instancia as string)))) {
        return res.status(400).json({ error: "Parameter ':id_instancia' should be a number"})
    }

    try {
        res.status(200).json(await service.getAllDimensions(parseInt(id_instancia as string)))
    } catch(error){
        res.status(500).json({ error: 'Error getting all dimensions'})
    }
}

const getOneDimension = async (req: Request, res: Response) => {
    const { params: { id_dimension }} = req

    if (id_dimension === undefined || isNaN(parseInt(id_dimension as string))) {
        return res.status(400).json({ error: "Parameter ':id_dimension' should be a number"})
    }

    try {
        res.status(200).json(await service.getOneDimension(parseInt(id_dimension as string)))
    } catch (error) {
        const statusCode = (error as CustomError).status || 500
        res.status(statusCode).json({ error: (error as CustomError).message})
    }
}

const createDimension = async (req: Request, res: Response) => {
    const { dimension } = req.body

    if (
        !dimension.nombre ||
        !dimension.id_instancia) {
            return res.status(400).json({ error: "Missing fields"})
    }

    try {
        res.status(201).json( await service.createDimension(dimension))
    } catch(error) {
        const statusCode = (error as CustomError).status || 500
        res.status(statusCode).json({ error: (error as CustomError).message})
    }
}

const deleteDimension = async (req: Request, res: Response) => {
    const { params: { id_dimension } } = req

    if (id_dimension === undefined || isNaN(parseInt(id_dimension as string))) {
        return res.status(400).json({ error: "Parameter ':id_dimension' should be a number"})
    }

    try {
        res.status(204).json(await service.deleteDimension(parseInt(id_dimension as string)))
    } catch (error) {
        const statusCode = (error as CustomError).status || 500
        const message = (error as CustomError).status ? (error as CustomError).message : 'Error deleting the dimension'
        res.status(statusCode).json({ error: message})
    }
}

const updateDimension = async (req: Request, res: Response) => {
    const { params: { id_dimension } } = req
    const { dimension } = req.body

    if (id_dimension === undefined || isNaN(parseInt(id_dimension as string))) {
        return res.status(400).json({ error: "Parameter ':id_dimension' should be a number"})
    }
    
    try {
        res.status(200).json(await service.updateDimension(parseInt(id_dimension as string), dimension))
    } catch (error) {
        const statusCode = (error as CustomError).status || 500
        const message = (error as CustomError).status ? (error as CustomError).message : 'Error deleting the dimension'
        res.status(statusCode).json({ error: message})
    }
}

export default {
    getAllDimensions,
    getOneDimension,
    createDimension,
    deleteDimension,
    updateDimension
}