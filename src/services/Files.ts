
import multer from 'multer';
import fs from 'fs/promises'
import projectService from '../services/project'
import { CustomError } from '../types/CustomError';
import knex from '../database/knex'

const customFileName = (req: any, file: any, cb: any) => {
  cb(null, file.originalname);
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: customFileName 
});

const fileFilter = (req: any, file: any, cb: any) => {
  const allowedExtensions = ['.zip', '.png', '.jpg', '.jpeg', '.pdf', '.doc', '.docx', '.xls', '.xlsx'];
  const fileExtension = file.originalname.slice(file.originalname.lastIndexOf('.')).toLowerCase();
  if (allowedExtensions.includes(fileExtension)) {
    cb(null, true);
  } else {
    cb(new Error('Solo las archivos tipo .zip, .png, .jpg, .jpeg, .pdf, .doc, .docx, .xls, and .xlsx estan permitidos'), false);
  }
};

export const upload = multer({ storage, fileFilter });

const getParticipantFileNames = async (id_proyecto: number, id_admin: number) => {
  const proyecto = (await projectService.getOneProject(id_proyecto)).proyecto;
  const cond = (await knex('instituciones_x_admins')
    .where({id_institucion: proyecto.id_institucion}))
    .some(p => p.id_admin == id_admin)

  if(!cond) {
    throw new CustomError('El administrador no pertenece a la institucion dueña del proyecto', 403)
  }

  const ids = proyecto.participantes.filter((obj: any) => obj.fecha_fin_eval == null).map((obj: any) => obj.id);
  const a: {id_evaluador: number, indicadores: any}[] = [];
  
  await Promise.all(ids.map(async (id: number) => {
    const {indicadores} = await getFilesEvaluador(id_proyecto, id);
    a.push({
      id_evaluador: id,
      indicadores: indicadores
    });
  }));
  return a
}

const getFilesEvaluador = async (id_proyecto: number, id_usuario: number) => {
  const { obligatoriedad_proposito } = (await projectService.getOneProject(id_proyecto)).proyecto;
  await projectService.verify_date(id_proyecto, id_usuario);
  const files = []
  const cantFolders = obligatoriedad_proposito ? 25 : 13;

  for (let j = 1; j < cantFolders; j++) {
    const fileFolder = `uploads/${id_proyecto}-${j}-${id_usuario}`
    try {
      await fs.access(fileFolder);  
      const fileNames = await fs.readdir(fileFolder);
      files.push({id_indicador: j, files: fileNames})
    } catch (err) {}
  }
  
  return {indicadores: files}
}

const getOneFile = async (id_proyecto: number, id_indicador: number, id_usuario: number, fileName: string) => {
  try {
      const fileFolder = `./uploads/${id_proyecto}-${id_indicador}-${id_usuario}`
      const filePath = `${fileFolder}/${fileName}`

      await fs.access(fileFolder);
      const exists = await fs.access(filePath).then(() => true).catch(() => false);

      if (exists) {
        return filePath
      } else {
        throw new CustomError(`El archivo '${fileName}' no existe en el sistema`, 404);
      }
  } catch (err) {
    if((err as any).code == 'ENOENT') {
      throw new CustomError(`El directorio donde el archivo debería estar no existe en el sistema`, 500);
    } 
    throw err
  }; 
};

const deleteFile = async(id_proyecto: number, id_indicador: number, id_usuario: number, fileName: string)=> {

  try {
    const fileFolder = `./uploads/${id_proyecto}-${id_indicador}-${id_usuario}`
    const filePath = `${fileFolder}/${fileName}`

    await fs.access(fileFolder);
    const exists = await fs.access(filePath).then(() => true).catch(() => false);

    if (exists) {
      await fs.unlink(filePath);
    } else {
      throw new CustomError(`El archivo '${fileName}' no existe en el sistema`, 404);
    }

    const files = await fs.readdir(fileFolder);
    if (files.length === 0) {
      // Elimina el directorio si está vacío
      await fs.rmdir(fileFolder);
      return { id_indicador: id_indicador, files: []}
    }

    return {id_indicador: id_indicador, files: files}

  } catch (err) {
  if((err as any).code == 'ENOENT') {
    throw new CustomError(`El directorio donde el archivo debería estar no existe en el sistema`, 500);
  } 
  throw err
}

}

export default { getFilesEvaluador, getParticipantFileNames, getOneFile, deleteFile }