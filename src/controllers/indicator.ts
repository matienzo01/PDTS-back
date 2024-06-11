import { Request, Response } from 'express';
import { CustomError } from '../types/CustomError';
import service from '../services/indicator'

const getAllIndicators = async(req: Request, res: Response) => {
    const {id_instancia, id_dimension} = req.query

    if (id_dimension != '' && (id_dimension === undefined || isNaN(parseInt(id_dimension as string)))) {
        return res.status(400).json({ error: "Parameter ':id_dimension' should be a number"})
    }

    if (id_instancia != '' && (id_instancia === undefined || isNaN(parseInt(id_instancia as string)))) {
        return res.status(400).json({ error: "Parameter ':id_instancia' should be a number"})
    }

    try {
        res.status(200).json(await service.getAllIndicators(parseInt(id_instancia as string), parseInt(id_dimension as string)))
    } catch(error) {
        const statusCode = (error as CustomError).status || 500
        const message = (error as CustomError).status ? (error as CustomError).message : 'Error getting all indicators'
        res.status(statusCode).json({ error: message})
    }
}

const getOneIndicator = async(req: Request, res: Response) => {
    const {params: { id_indicador }} = req

    if (id_indicador === undefined || isNaN(parseInt(id_indicador as string))) {
        return res.status(400).json({ error: "Parameter ':id_indicador' should be a number"})
    }

    try {
        res.status(200).json(await service.getOneIndicator(parseInt(id_indicador as string)))
    } catch(error) {
        const statusCode = (error as CustomError).status || 500
        const message = (error as CustomError).status ? (error as CustomError).message : 'Error getting the indicator'
        res.status(statusCode).json({ error: message})
    }
}

const createIndicator = async(req: Request, res: Response) => {

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
        const statusCode = (error as CustomError).status || 500
        const message = (error as CustomError).status ? (error as CustomError).message : 'Error creating the indicator'
        res.status(statusCode).json({ error: message})
    }
}

const deleteIndicator = async(req: Request, res: Response) => {
    const { params: { id_indicador } } = req

    if (id_indicador === undefined || isNaN(parseInt(id_indicador as string))) {
        return res.status(400).json({ error: "Parameter ':id_indicador' should be a number"})
    }

    try {
        res.status(204).json(await service.deleteIndicator(parseInt(id_indicador as string)))
    } catch (error){
        const statusCode = (error as CustomError).status || 500
        const message = (error as CustomError).status ? (error as CustomError).message : 'Error deleting the indicator'
        res.status(statusCode).json({ error: message})
    }
}

const updateIndicator = async(req: Request, res: Response) => {
    const { params: { id_indicador } } = req
    const { indicador } = req.body 
    
    try {
        res.status(200).json(await service.updateIndicator(parseInt(id_indicador as string), indicador))
    } catch (error){
        const statusCode = (error as CustomError).status || 500
        const message = (error as CustomError).status ? (error as CustomError).message : 'Error updating the indicator'
        res.status(statusCode).json({ error: message})
    }
}

export default {
    getAllIndicators,
    getOneIndicator,
    createIndicator,
    deleteIndicator,
    updateIndicator
}