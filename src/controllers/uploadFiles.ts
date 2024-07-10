
import { Request, Response, NextFunction  } from 'express';
import fileService from '../services/Files'
import utils from './utils';


export const uploadFile = (req: Request, res: Response): void => {
  if (!req.file) {
    res.status(400).send('No se subió ningun archivo');
    return;
  }

  res.status(200).json({id_indicador: parseInt(req.params.id_indicador), files: req.body.files});
};

export const getFileNames = async(req: Request, res: Response, next: NextFunction) => {
  const id_proyecto = parseInt(req.params.id_proyecto)
  const {id:id_usuario, rol} = req.body.userData; 

  try {
    if(rol == 'evaluador'){
      res.status(200).json(await fileService.getFilesEvaluador(id_proyecto, id_usuario))
    } else {
      res.status(200).json(await fileService.getParticipantFileNames(id_proyecto, id_usuario))
    }
  } catch (error) {
    next(error)
  }
};

export const getFile = async(req: Request, res: Response, next: NextFunction) => {
  const {params: {file_name, id_proyecto, id_indicador}} = req
  const {id:id_usuario, rol} = req.body.userData; 

  //hay que verificar que:
  // 1) si es evaluador ==> pertenezca al proyecto
  // 2) si es admin cyt ==> que forme parte de la inst dueña del proyecto
  // 3) si es admin general ==> todo pelota


  try {
    utils.validateNumberParameter(id_proyecto, 'id_proyecto')
    utils.validateNumberParameter(id_indicador, 'id_indicador')
    res.status(200).contentType('application/pdf').download(await fileService.getOneFile(parseInt(id_proyecto), parseInt(id_indicador), id_usuario, file_name), file_name)
  } catch(error) {
    next(error)
  }
}

export const deleteFile = async(req: Request, res: Response, next: NextFunction) => {
  const {params: {file_name, id_proyecto, id_indicador}} = req
  const {id:id_usuario} = req.body.userData; 

  //hay que verificar que el usuario este vinculado al proyecto

  try {
    utils.validateNumberParameter(id_proyecto, 'id_proyecto')
    utils.validateNumberParameter(id_indicador, 'id_indicador')
    res.status(200).json(await fileService.deleteFile(parseInt(id_proyecto), parseInt(id_indicador), id_usuario, file_name))
  } catch(error) {
    next(error)
  }

}