import service from '../services/eval';
import pdfService from '../services/pdf';
import { Request, Response } from 'express';
import { CustomError } from '../types/CustomError';

const generatePDF = async(req: Request, res: Response) => {
  const { params: { id_proyecto } } = req
  const { id:id_usuario } = req.body.userData

  try {
    const pdfBuffer = await pdfService.generatePDF(parseInt(id_proyecto), parseInt(id_usuario));
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="output.pdf"');
    res.send(pdfBuffer); 
  } catch (error) {
    const statusCode = (error as CustomError).status || 500
    res.status(statusCode).json({ error: (error as CustomError).message })
  }
};

function validateNumberParameter(id_proyecto: any, id_usuario: any) { 

  if (isNaN(id_proyecto)) {
    throw new CustomError('Parameter id_proyecto should be a number', 400)
  }
  if (isNaN(id_usuario)) {
    throw new CustomError('Parameter id_usuario should be a number', 400)
  }
}

const getEntidad = async(req: Request, res: Response) => {
  const { params: { id_proyecto } } = req
  const { id:id_usuario, rol } = req.body.userData

  try {
    validateNumberParameter(id_proyecto, id_usuario)
    const Entidad = await service.getEntidad(parseInt(id_proyecto), parseInt(id_usuario), rol)
    return res.status(200).json(Entidad)
  } catch(error) {
    const statusCode = (error as CustomError).status || 500
    return res.status(statusCode).json({ error: (error as CustomError).message })
  }
}

const getProposito = async(req: Request, res: Response) => {
  const { params: { id_proyecto } } = req
  const { id:id_usuario, rol } = req.body.userData

  try {
    validateNumberParameter(id_proyecto, id_usuario)
    const Proposito = await service.getProposito(parseInt(id_proyecto), parseInt(id_usuario), rol)
    res.status(200).json(Proposito)
  } catch(error) {
    const statusCode = (error as CustomError).status || 500
    res.status(statusCode).json({ message: (error as CustomError).message })
  }
  
}

const saveForm = async(req: Request, res: Response) => {
  const { params: { id_proyecto } } = req
  const { id:id_usuario } = req.body.userData
  const { respuestas } = req.body

  try {
    validateNumberParameter(id_proyecto, id_usuario)
    res.status(200).json(await service.saveForm(parseInt(id_proyecto), parseInt(id_usuario), respuestas))
  } catch(error) {
    const statusCode = (error as CustomError).status || 500
    res.status(statusCode).json({ error: (error as CustomError).message })
  }
  
}

const finalizarEvaluacion = async(req: Request, res: Response) => {
  const { params: { id_proyecto } } = req
  const { id:id_usuario, rol } = req.body.userData

  try {
    validateNumberParameter(id_proyecto, id_usuario)
    res.status(200).json(await service.finalizarEvaluacion(parseInt(id_proyecto), parseInt(id_usuario), rol))
  } catch(error) {
    const statusCode = (error as CustomError).status || 500
    const questions = (error as CustomError).questions || undefined
    res.status(statusCode).json({ error: (error as CustomError).message, questions: questions})
  }
}

export default {
  generatePDF,

  getEntidad,
  getProposito,
  saveForm,
  finalizarEvaluacion
}