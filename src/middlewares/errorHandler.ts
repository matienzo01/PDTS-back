import { Request, Response, NextFunction } from 'express';
import { CustomError } from '../types/CustomError';
import Files from '../services/Files';

const errorHandler = async(err: CustomError, req: Request, res: Response, next: NextFunction) => {

  if(req.file && req.body.proyecto){
    const folder = `informe/${req.body.proyecto.titulo}`
    try {
      await Files.deleteInforme(folder, req.file.originalname)
    } catch (error) {
      try {
        await Files.deleteInforme('', req.file.originalname)
      } catch (err) {

      }
    }
  }

  const statusCode = err.status || 500;
  const questions = (err as CustomError).questions || undefined
  res.status(statusCode).json({ error: err.message, questions: questions });
};

export default errorHandler;