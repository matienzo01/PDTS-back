import { Request, Response, NextFunction } from 'express';
import fs from 'fs';
import projectService from '../services/project'
import evalService from '../services/eval';
import { CustomError } from '../types/CustomError';

const checkFolder = async(folder: string) => {
    if (!fs.existsSync(folder)) {
        fs.mkdirSync(folder, { recursive: true });
    }
}

const renameFileFundamentacion = async(req: Request, res: Response, next: NextFunction) => {
    
    if (!req.file) {
        return res.status(400).send('No se subio ningun archivo.');
    }

    const originalPath = `uploads/${req.file.originalname}`
    const id_proyecto = parseInt(req.params.id_proyecto)
    const id_indicador = parseInt(req.params.id_indicador)
    const id_usuario = req.body.userData.id; 

    try {
        //1) existe proyecto?
        const { id_estado_eval, id_director, obligatoriedad_proposito, titulo } = (await projectService.getOneProject(id_proyecto)).proyecto
        //2) el usuario esta vinculado al proyecto?
        const assigned = await projectService.verify_date(id_proyecto, id_usuario)
        //3) puuede responder?
        if (id_estado_eval == 4) {
            throw new CustomError('The evaluation had already been closed.', 409)
        }

        if (assigned.fecha_fin_eval != null ) {
            throw new CustomError('The user already finished the evaluation', 409)
        }

        if (id_usuario != id_director && id_estado_eval < 3) {
            throw new CustomError('The project manager must complete the evaluation first', 409)
        }

        //4) es un indicador valido?
        if (await evalService.validateAnswers([{id_indicador: id_indicador}]) && !obligatoriedad_proposito ){
            throw new CustomError("The proposito instance should not be evaluated in this project", 400)
        }

        let fileFolder =`uploads/${titulo}/fundamentaciones`
        checkFolder(fileFolder)
        fileFolder = fileFolder.concat(`/${id_indicador}-${id_usuario}`)
        checkFolder(fileFolder)

        const files = fs.readdirSync(fileFolder);
        const fileCount = files.filter(file => {
            const filePath = `${fileFolder}/${file}`
            return fs.statSync(filePath).isFile();
          }).length;

        if(fileCount > 4) {
            throw new CustomError("Se pueden subir como maximo 5 archivos por indicador", 429)
        }

        fs.rename(originalPath, `${fileFolder}/${req.file.originalname}`, (err) => {})
        if (!files.includes(req.file.originalname)){
            files.push(req.file.originalname)
        }
        req.body.files = files
        next();

    } catch (error){
        fs.unlink(originalPath, (err) => {});
        const statusCode = (error as CustomError).status || 500
        res.status(statusCode).json({ error: (error as CustomError).message })
    }
};

const renameFileInforme = async(req: Request, res: Response, next: NextFunction) => {

    if (!req.file) {
        return res.status(400).send('No se subio ningun archivo.');
    }

    const { titulo } = JSON.parse(req.body.proyecto)

    let fileFolder = `uploads/${titulo}`
    const originalPath = `uploads/${req.file.originalname}`

    try{
        fs.mkdirSync(fileFolder, { recursive: true });
        fileFolder = fileFolder.concat('/informe')
        fs.mkdirSync(fileFolder, { recursive: true });

        fs.rename(originalPath, `${fileFolder}/${req.file.originalname}`, (err) => {})
        next();
    } catch(error) {
        fs.unlink(originalPath, (err) => {});
        const statusCode = (error as CustomError).status || 500
        res.status(statusCode).json({ error: (error as CustomError).message })
    }
    
}

export default {
    renameFileFundamentacion,
    renameFileInforme
};