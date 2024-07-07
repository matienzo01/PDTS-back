import service from '../services/question';
import { Request, Response, NextFunction  } from 'express';
import { CustomError } from '../types/CustomError';
import utils from './utils';

const getAllQuestions = async(req: Request, res: Response) => {
    const { id_seccion } = req.query

    try {
        utils.validateNumberParameter(id_seccion, 'id_seccion')
        res.status(200).json(await service.getAllQuestions(parseInt(id_seccion as string)))
    } catch(error){
        const statusCode = (error as CustomError).status || 500
        res.status(statusCode).json({ error: (error as CustomError).message})
    }
}

const getOneQuestion = async(req: Request, res: Response, next: NextFunction) => {
    const { params: { id_pregunta }} = req

    try {
        utils.validateNumberParameter(id_pregunta, 'id_pregunta')
        res.status(200).json(await service.getOneQuestion(parseInt(id_pregunta as string)))
    } catch(error){
        next(error)
    }

}

const creteQuestion = async(req: Request, res: Response, next: NextFunction) => {
    const { pregunta } = req.body

    //hay que chequear los campos de la pregunta

    try {
        res.status(200).json(await service.creteQuestion(pregunta))
    } catch(error){
        next(error)
    }
}

const deleteQuestion = async(req: Request, res: Response) => {

}

const updateQuestion = async(req: Request, res: Response) => {

}

export default {
    getAllQuestions,
    getOneQuestion,
    creteQuestion,
    deleteQuestion,
    updateQuestion
}