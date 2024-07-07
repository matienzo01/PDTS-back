
import { Request, Response, NextFunction  } from 'express';
import fileService from '../services/Files'


export const uploadFile = (req: Request, res: Response): void => {
  if (!req.file) {
    res.status(400).send('No se subió ningun archivo');
    return;
  }

  const fileName = req.file.filename;
  res.status(200).json({message: `Archivo guardado exitosamente. Nombre del archivo: ${fileName}`});
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
  const {params: {file_name}} = req

  try {
    res.status(200).json(await fileService.getOneFile(file_name))
  } catch(error) {
    next(error)
  }
}