import { Request, Response } from 'express';
import fileService from '../services/Files'

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
  const id_usuario = req.body.userData.id; 

  try {
    res.status(200).json( await fileService.getFiles(id_proyecto, id_usuario))
  } catch (error) {
    
  }
};