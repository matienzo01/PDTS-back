import { Request, Response, NextFunction } from 'express';
import { CustomError } from '../types/CustomError';

const errorHandler = (err: CustomError, req: Request, res: Response, next: NextFunction) => {
  const statusCode = err.status || 500;
  const questions = (err as CustomError).questions || undefined
  res.status(statusCode).json({ error: err.message, questions: questions });
};

export default errorHandler;