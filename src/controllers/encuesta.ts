import service from '../services/encuesta';
import { Request, Response, NextFunction  } from 'express';
import utils from './utils';

const getEncuesta = async(req: Request, res: Response, next: NextFunction) => {
    const { params: { id_proyecto } } = req
    const { id:id_usuario, rol } = req.body.userData
    
    try {
        utils.validateNumberParameter(id_proyecto, 'id_proyecto')
        utils.validateNumberParameter(id_usuario, 'id_usuario')
        res.status(200).json(await service.getEncuesta(parseInt(id_proyecto), id_usuario, rol))
    } catch(error) {
        next(error)
    }
}

const postEncuesta = async(req: Request, res: Response, next: NextFunction) =>{
    const { params: { id_proyecto } } = req
    const { respuestas } = req.body
    const { id:id_usuario } = req.body.userData

    try {
        utils.validateNumberParameter(id_proyecto, 'id_proyecto')
        utils.validateNumberParameter(id_usuario, 'id_usuario')
        await service.postEncuesta(parseInt(id_proyecto), id_usuario, respuestas)
        res.status(200).json(await service.getEncuesta(parseInt(id_proyecto), id_usuario, 'evaluador'))
    } catch(error) {
        next(error)
    }
}

const finallizarEncuesta = async(req: Request, res: Response, next: NextFunction) => {
    const { params: { id_proyecto } } = req
    const { id:id_usuario } = req.body.userData
  
    try {
        utils.validateNumberParameter(id_proyecto, 'id_proyecto')
        utils.validateNumberParameter(id_usuario, 'id_usuario')
        res.status(200).json(await service.finallizarEncuesta(parseInt(id_proyecto), parseInt(id_usuario)))
    } catch(error) {
        next(error)
    }
}

const getPromedios = async(req: Request, res: Response, next: NextFunction) => {
    try {
        res.status(200).json(await service.getPromedios())
    } catch(error) {
        next(error)
    }
}

export default {
    getEncuesta,
    postEncuesta,
    finallizarEncuesta,
    getPromedios
}