import service from '../services/section'
import { Request, Response } from 'express';
import { CustomError } from '../types/CustomError';

const getAllSecciones = async (req: Request, res: Response) => {

    try {
        res.status(200).json(await service.getAllSecciones())
    } catch(error){
        const statusCode = (error as CustomError).status || 500
        res.status(statusCode).json({ error: (error as CustomError).message})
    }
}

const getOneSeccion = async (req: Request, res: Response) => {
    const { params: { id_seccion }} = req

    if (id_seccion === undefined || isNaN(parseInt(id_seccion as string))) {
        return res.status(400).json({ error: "Parameter ':id_seccion' should be a number"})
    }

    try {
        res.status(200).json(await service.getOneSeccion(parseInt(id_seccion as string)))
    } catch (error) {
        const statusCode = (error as CustomError).status || 500
        res.status(statusCode).json({ error: (error as CustomError).message})
    }
}

const createSeccion = async (req: Request, res: Response) => {
    const { seccion } = req.body

    if (!seccion.nombre) {
        res.status(400).json({ error: "Missing fields"})
        return ;
    }

    try {
        res.status(201).json( await service.createSeccion(seccion))
    } catch(error) {
        const statusCode = (error as CustomError).status || 500
        res.status(statusCode).json({ error: (error as CustomError).message})
    }
}

const deleteSeccion = async (req: Request, res: Response) => {
    const { params: { id_seccion } } = req

    if (id_seccion === undefined || isNaN(parseInt(id_seccion as string))) {
        return res.status(400).json({ error: "Parameter ':id_seccion' should be a number"})
    }

    try {
        res.status(204).json(await service.deleteSeccion(parseInt(id_seccion as string)))
    } catch (error) {
        const statusCode = (error as CustomError).status || 500
        const message = (error as CustomError).status ? (error as CustomError).message : 'Error deleting the seccion'
        res.status(statusCode).json({ error: message})
    }
}

const updateSeccion = async (req: Request, res: Response) => {
    const { params: { id_seccion } } = req
    const { seccion } = req.body

    if (id_seccion === undefined || isNaN(parseInt(id_seccion as string))) {
        return res.status(400).json({ error: "Parameter ':id_seccion' should be a number"})
    }

    try {
        res.status(200).json(await service.updateSeccion(parseInt(id_seccion as string), seccion))
    } catch (error) {
        const statusCode = (error as CustomError).status || 500
        const message = (error as CustomError).status ? (error as CustomError).message : 'Error updating the seccion'
        res.status(statusCode).json({ error: message})
    }
}

export default {
    getAllSecciones,
    getOneSeccion,
    createSeccion,
    deleteSeccion,
    updateSeccion
}