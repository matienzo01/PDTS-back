import { Request, Response, NextFunction  } from 'express';
import fileService from '../services/Files'
import utils from './utils';
import projectService from '../services/project';


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
  const {id:id_usuario, rol, institutionId} = req.body.userData; 

  try {
    utils.validateNumberParameter(id_proyecto, 'id_proyecto')
    utils.validateNumberParameter(id_indicador, 'id_indicador')
    const { proyecto } = (await projectService.getOneProject(parseInt(id_proyecto)))

    if(rol == 'evaluador') {
      await projectService.verify_date(parseInt(id_proyecto), id_usuario)
    } else if (rol == 'admin') {
      await utils.ownInstitution(rol, id_usuario, proyecto.id_institucion)
    }

    const fileFolder = `./uploads/${proyecto.titulo}/fundamentaciones/${id_indicador}-${id_usuario}`
    res.status(200).download(await fileService.getOneFile(fileFolder, file_name), file_name)

  } catch(error) {
    next(error)
  }
}

export const getInforme = async(req: Request, res: Response, next: NextFunction) => {
  const {params: { id_proyecto}} = req
  const {id:id_usuario, rol} = req.body.userData; 

  try {
    utils.validateNumberParameter(id_proyecto, 'id_proyecto')
    const { proyecto } = (await projectService.getOneProject(parseInt(id_proyecto)))

    if(rol == 'evaluador') {
      await projectService.verify_date(parseInt(id_proyecto), id_usuario)
    } else if (rol == 'admin') {
      await utils.ownInstitution(rol, id_usuario, proyecto.id_institucion)
    }

    const file_name = await fileService.getNombreInforme(proyecto.titulo)
    const fileFolder = `./uploads/${proyecto.titulo}/informe`
    res.status(200).download(await fileService.getOneFile(fileFolder, file_name), file_name)
  } catch(error) {
    next(error)
  }
}


export const deleteFile = async(req: Request, res: Response, next: NextFunction) => {
  const {params: {file_name, id_proyecto, id_indicador}} = req
  const {id:id_usuario} = req.body.userData; 

  try {
    utils.validateNumberParameter(id_proyecto, 'id_proyecto')
    utils.validateNumberParameter(id_indicador, 'id_indicador')
    const { titulo } = (await projectService.getOneProject(parseInt(id_proyecto))).proyecto
    await projectService.verify_date(parseInt(id_proyecto), id_usuario)
    res.status(200).json(await fileService.deleteFile(titulo, parseInt(id_indicador), id_usuario, file_name))
  } catch(error) {
    next(error)
  }

}