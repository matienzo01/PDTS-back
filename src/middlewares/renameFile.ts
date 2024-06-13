/*import { Request, Response, NextFunction } from 'express';
import fs from 'fs';
import projectService from '../services/project'
import evalService from '../services/eval';
import { CustomError } from '../types/CustomError';

const renameFile = async(req: Request, res: Response, next: NextFunction) => {
    
    if (!req.file) {
        res.status(400).send('No file uploaded.');
        return;
    }

    const originalPath = `uploads/${req.file.originalname}`
    const id_proyecto = parseInt(req.params.id_proyecto)
    const id_indicador = parseInt(req.body.indicadorId)
    const id_usuario = req.body.userData.id; 

    try {
        //1) existe proyecto?
        const { id_estado_eval, id_director, obligatoriedad_proposito } = (await projectService.getOneProject(id_proyecto)).proyecto
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

        const newFileName = `${id_proyecto}-${id_indicador}-${id_usuario}.zip`
        fs.rename(originalPath, `uploads/${newFileName}`, (err) => {})

        req.file.filename = newFileName;
        next();

    } catch (error){
        fs.unlink(originalPath, (err) => {});
        const statusCode = (error as CustomError).status || 500
        res.status(statusCode).json({ error: (error as CustomError).message })
    }
};

export default renameFile;*/