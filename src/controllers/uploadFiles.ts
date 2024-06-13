/*
import { Request, Response } from 'express';
import fileService from '../services/Files'
import { CustomError } from '../types/CustomError';


export const uploadFile = (req: Request, res: Response): void => {
  if (!req.file) {
    res.status(400).send('No file uploaded.');
    return;
  }

  const fileName = req.file.filename;
  res.status(200).json({message: `File uploaded successfully. Filename: ${fileName}`});
};

export const getFiles = async(req: Request, res: Response) => {
  const id_proyecto = parseInt(req.params.id_proyecto)
  const {id:id_usuario, rol} = req.body.userData; 

  try {
    if(rol == 'evaluador'){
      res.status(200).json(await fileService.getFilesEvaluador(id_proyecto, id_usuario))
    } else {
      res.status(200).json(await fileService.getParticipantFiles(id_proyecto, id_usuario))
    }
  } catch (error) {
    const statusCode = (error as CustomError).status || 500
    res.status(statusCode).json({ error: (error as CustomError).message })
  }
};*/