import service from '../services/question';
import { Request, Response } from 'express';
import { CustomError } from '../types/CustomError';

const getAllQuestions = async(req: Request, res: Response) => {
    const { id_seccion } = req.query

    if ( id_seccion != '' && (id_seccion === undefined || isNaN(parseInt(id_seccion as string)))) {
        return res.status(400).json({ error: "Parameter ':id_seccion' should be a number"})
    }

    try {
        res.status(200).json(await service.getAllQuestions(parseInt(id_seccion as string)))
    } catch(error){
        const statusCode = (error as CustomError).status || 500
        res.status(statusCode).json({ error: (error as CustomError).message})
    }
}

const getOneQuestion = async(req: Request, res: Response) => {
    const { params: { id_pregunta }} = req

    try {
        res.status(200).json(await service.getOneQuestion(parseInt(id_pregunta as string)))
    } catch(error){
        const statusCode = (error as CustomError).status || 500
        res.status(statusCode).json({ error: (error as CustomError).message})
    }

}

const creteQuestion = async(req: Request, res: Response) => {
    const { pregunta } = req.body

    try {
        res.status(200).json(await service.creteQuestion(pregunta))
    } catch(error){
        const statusCode = (error as CustomError).status || 500
        res.status(statusCode).json({ error: (error as CustomError).message})
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