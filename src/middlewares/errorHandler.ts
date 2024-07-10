import { Request, Response, NextFunction } from 'express';
import { CustomError } from '../types/CustomError';
import Files from '../services/Files';

const errorHandler = (err: CustomError, req: Request, res: Response, next: NextFunction) => {

  if(req.file && req.body.proyecto){
    const folder = `informe/${req.body.proyecto.titulo}`
    try {
      Files.deleteInforme(folder, req.file.originalname)
    } catch (error) {
      console.log(error)
    }
  }

  const statusCode = err.status || 500;
  const questions = (err as CustomError).questions || undefined
  res.status(statusCode).json({ error: err.message, questions: questions });
};

export default errorHandler;