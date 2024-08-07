
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
  if (file.originalname.endsWith('.zip')) {
    cb(null, true);
  } else {
    cb(new Error('Only .zip files are allowed'), false);
  }
};

export const upload = multer({ storage, fileFilter });


// `${id_proyecto}-${id_indicador}-${id_usuario}.zip`
const getNames = (id_proyecto: number, id_user:number , proposito: boolean): string[] => {
  const cant = proposito ? 25 : 13;
  const names: string[] = [];

  for (let j = 1; j < cant; j++) {
    names.push(`${id_proyecto}-${j}-${id_user}.zip`);
  }
  return names;
}

const getParticipantFileNames = async (id_proyecto: number, id_admin: number) => {
  const proyecto = (await projectService.getOneProject(id_proyecto)).proyecto;
  const cond = (await knex('instituciones_x_admins')
    .where({id_institucion: proyecto.id_institucion}))
    .some(p => p.id_admin == id_admin)

  if(!cond) {
    throw new CustomError('The admin dont belong to the institution that owns the project', 403)
  }

  const ids = proyecto.participantes.filter((obj: any) => obj.fecha_fin_eval == null).map((obj: any) => obj.id);
  const a: {id_evaluador: number, files: any}[] = [];
  
  await Promise.all(ids.map(async (id: number) => {
    const data = await getFilesEvaluador(id_proyecto, id);
    a.push(data[0]);
  }));
  return a
}

const getFilesEvaluador = async (id_proyecto: number, id_usuario: number) => {
  const { obligatoriedad_proposito } = (await projectService.getOneProject(id_proyecto)).proyecto;
  await projectService.verify_date(id_proyecto, id_usuario);
  const names: string[] = getNames(id_proyecto, id_usuario, obligatoriedad_proposito);
  
  return [{id_evaluador: id_usuario, files: await getFileNamesEvaluador(names)}]
}

const getFileNamesEvaluador = async(names: string[]) => {
  const filesArray: { id_indicador: number, fileName: string }[] = [];
  try {
    const files = await fs.readdir('./uploads'); 
    const matchedFiles = files.filter(file => names.includes(file));
    
    for (const fileName of matchedFiles) {
      try {
        filesArray.push({ id_indicador : parseInt(fileName.split('-')[1]), fileName  });
      } catch (err) {
        throw new CustomError(`Unable to read file ${fileName}`, 500);
      }
    }
  } catch (err) {
    throw new CustomError('a', 500);
  }

  return filesArray; 
}

const getOneFile = async (fileName: string) => {

  let fileContent

  try {
      const filePath = `./uploads/${fileName}`;
      fileContent = await fs.readFile(filePath, 'base64'); 
  } catch (err) {
    throw new CustomError(`Unable to read file ${fileName}`, 500);
  }

  return {file: fileContent}; 
};

export default { getFilesEvaluador, getParticipantFileNames, getOneFile }