import service from '../services/encuesta';
import { Request, Response } from 'express';
import { CustomError } from '../types/CustomError';

async function validateNumberParameter(res: Response, id_proyecto: any, id_usuario: any) { 
    if (isNaN(id_proyecto)) {
      return res.status(400).json({ error: `Parameter id_proyecto should be a number` });
    }
    if (isNaN(id_usuario)) {
      return res.status(400).json({ error: `Parameter id_usuario should be a number` });
    }
  }

const getEncuesta = async(req: Request, res: Response) => {
    const { params: { id_proyecto } } = req
    const { id:id_usuario, rol } = req.body.userData
    
    validateNumberParameter(res, id_proyecto, id_usuario)

    try {
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

    validateNumberParameter(res, id_proyecto, id_usuario)

    try {
        await service.postEncuesta(parseInt(id_proyecto), id_usuario, respuestas)
        res.status(200).json(await service.getEncuesta(parseInt(id_proyecto), id_usuario, 'evaluador'))
    } catch(error) {
        const statusCode = (error as CustomError).status || 500
        res.status(statusCode).json({ message: (error as CustomError).message })
    }

}

export default {
    getEncuesta,
    postEncuesta
}