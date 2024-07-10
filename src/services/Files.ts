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

const createFileFilter = (allowedExtensions: string[], errorMessage: string) => {
  return (req: any, file: any, cb: any) => {
    const fileExtension = file.originalname.slice(file.originalname.lastIndexOf('.')).toLowerCase();
    if (allowedExtensions.includes(fileExtension)) {
      cb(null, true);
    } else {
      cb(new Error(errorMessage), false);
    }
  };
};

const fileFilter1 = createFileFilter(
  ['.zip', '.png', '.jpg', '.jpeg', '.pdf', '.doc', '.docx', '.xls', '.xlsx'],
  'Solo los archivos tipo .zip, .png, .jpg, .jpeg, .pdf, .doc, .docx, .xls, and .xlsx están permitidos'
);

const fileFilter2 = createFileFilter(
  ['.pdf'],
  'Solo los archivos tipo .pdf están permitidos'
);

export const uploadFundamentacion = multer({ storage, fileFilter: fileFilter1 });
export const uploadInforme = multer({ storage, fileFilter: fileFilter2 });

const fileExists = async (path: string): Promise<boolean> => {
  try {
    await fs.access(path);
    return true;
  } catch {
    return false;
  }
};

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
  const { obligatoriedad_proposito, titulo } = (await projectService.getOneProject(id_proyecto)).proyecto;
  await projectService.verify_date(id_proyecto, id_usuario);
  const files = []
  const cantFolders = obligatoriedad_proposito ? 25 : 13;

  for (let j = 1; j < cantFolders; j++) {
    const fileFolder = `uploads/${titulo}/fundamentaciones/${j}-${id_usuario}`
    try {
      await fs.access(fileFolder);  
      const fileNames = await fs.readdir(fileFolder);
      files.push({id_indicador: j, files: fileNames})
    } catch (err) {}
  }
  
  return {indicadores: files}
}

const getInforme = async() => {

}

const getOneFile = async (fileFolder: string, fileName: string) => {
  let fileContent
  const filePath = `${fileFolder}/${fileName}`
  try {
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
  }
};

const ensurePathExists = async (path: string, type: 'file' | 'directory', errorMessage: string) => {
  try {
    await fs.access(path);
  } catch {
    throw new CustomError(errorMessage, type === 'file' ? 404 : 500);
  }
};

const deleteFile = async (folder: string, id_indicador: number, id_usuario: number, fileName: string) => {
  try {
    const fileFolder = `./uploads/${folder}/fundamentaciones/${id_indicador}-${id_usuario}`;
    const filePath = `${fileFolder}/${fileName}`;

    await ensurePathExists(fileFolder, 'directory', `El directorio donde el archivo debería estar no existe en el sistema`);
    await ensurePathExists(filePath, 'file', `El archivo '${fileName}' no existe en el sistema`);

    await fs.unlink(filePath);

    const files = await fs.readdir(fileFolder);
    if (files.length === 0) {
      await fs.rmdir(fileFolder);
    }

    return { id_indicador, files: files.length === 0 ? [] : files };
  } catch (err) {
    throw err;
  }
};

const deleteInforme = async (folder: string, fileName: string) => {
  try {
    const fileFolder = `./uploads/${folder}`;
    const filePath = `${fileFolder}/${fileName}`;

    await ensurePathExists(fileFolder, 'directory', `El directorio donde el archivo debería estar no existe en el sistema`);
    await ensurePathExists(filePath, 'file', `El archivo '${fileName}' no existe en el sistema`);

    await fs.unlink(filePath);
  } catch (err) {
    throw err;
  }
};

const getNombreInforme = async(titulo: string) => {
  try {
    return (await fs.readdir(`uploads/${titulo}/informe`))[0];
  } catch(error) {
    return " "
  }
}

const deleteUserFundamentaciones = async(titulo: string, id_usuario: number) => {
  const baseFolder = `uploads/${titulo}/fundamentaciones`
  try {
    const folders = await fs.readdir(baseFolder);
    const filteredArray = folders.filter(item => item.endsWith(`-${id_usuario}`));
    for(let j = 0; j<filteredArray.length; j++){
      const folderPath = `uploads/${titulo}/fundamentaciones/${filteredArray[j]}`
      const files = await fs.readdir(folderPath);
      for(let i = 0; i<files.length; i++){
        const filePath = `${folderPath}/${files[i]}`
        console.log(filePath)
        await fs.unlink(filePath);
      }
      await fs.rmdir(folderPath);
    }
  } catch(error) {
    console.log(error)
  }
}

export default { 
  getFilesEvaluador, 
  getParticipantFileNames, 
  getOneFile, 
  deleteFile, 
  deleteInforme, 
  getNombreInforme, 
  deleteUserFundamentaciones }