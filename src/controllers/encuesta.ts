import service from '../services/encuesta';
import { Request, Response } from 'express';
import { CustomError } from '../types/CustomError';

function validateNumberParameter(id_proyecto: any, id_usuario: any) { 
    if (isNaN(id_proyecto)) {
      throw new CustomError('Parameter id_proyecto should be a number', 400)
    }
    if (isNaN(id_usuario)) {
      throw new CustomError('Parameter id_usuario should be a number', 400)
    }
}

const getEncuesta = async(req: Request, res: Response) => {
    const { params: { id_proyecto } } = req
    const { id:id_usuario, rol } = req.body.userData
    
    try {
        validateNumberParameter(id_proyecto, id_usuario)
        res.status(200).json(await service.getEncuesta(parseInt(id_proyecto), id_usuario, rol))
    } catch(error) {
        const statusCode = (error as CustomError).status || 500
        res.status(statusCode).json({ message: (error as CustomError).message })
    }

}

const postEncuesta = async(req: Request, res: Response) =>{
    const { params: { id_proyecto } } = req
    const { respuestas } = req.body
    const { id:id_usuario } = req.body.userData

    try {
        validateNumberParameter(id_proyecto, id_usuario)
        await service.postEncuesta(parseInt(id_proyecto), id_usuario, respuestas)
        res.status(200).json(await service.getEncuesta(parseInt(id_proyecto), id_usuario, 'evaluador'))
    } catch(error) {
        const statusCode = (error as CustomError).status || 500
        res.status(statusCode).json({ message: (error as CustomError).message })
    }

}

const finallizarEncuesta = async(req: Request, res: Response) => {
    const { params: { id_proyecto } } = req
    const { id:id_usuario, rol } = req.body.userData
  
    try {
      validateNumberParameter(id_proyecto, id_usuario)
      res.status(200).json(await service.finallizarEncuesta(parseInt(id_proyecto), parseInt(id_usuario)))
    } catch(error) {
      const statusCode = (error as CustomError).status || 500
      res.status(statusCode).json({ error: (error as CustomError).message })
    }
  }

export default {
    getEncuesta,
    postEncuesta,
    finallizarEncuesta
}