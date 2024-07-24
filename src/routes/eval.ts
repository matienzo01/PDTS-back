import express from 'express'
const router = express.Router()
import controller from '../controllers/eval'
import authUser from '../middlewares/authUser'
import checkRol from '../middlewares/checkRol'


import renameFile from '../middlewares/renameFile'
import { uploadFile, getFileNames, getFile, deleteFile } from '../controllers/uploadFiles';
import { uploadFundamentacion } from '../services/Files';

router
    .get('/entidad/:id_proyecto', authUser, checkRol(['evaluador', 'admin']), controller.getEntidad)
    .get('/proposito/:id_proyecto', authUser, checkRol(['evaluador', 'admin']), controller.getProposito)
    .post('/form/:id_proyecto', authUser, checkRol(['evaluador']), controller.saveForm)
    .put('/:id_proyecto/finalizar', authUser, checkRol(['evaluador','admin']), controller.finalizarEvaluacion) 
    .get('/:id_proyecto/resumen', authUser, checkRol(['admin','admin general']), controller.getResumen) 
    .post('/form/:id_proyecto/:id_indicador/files', (req, res, next) => {
        uploadFundamentacion.single('file')(req, res, (err) => {
            if (err) {
              return res.status(400).send({ error: err.message });
            }
            next();
        });
    }, authUser, checkRol(['evaluador']), renameFile.renameFileFundamentacion ,uploadFile)
    .get('/form/:id_proyecto/files', authUser, checkRol(['evaluador','admin']), getFileNames)
    .get('/form/:id_proyecto/:id_indicador/files/:file_name', authUser, checkRol(['evaluador','admin']), getFile)
    .delete('/form/:id_proyecto/:id_indicador/files/:file_name', authUser, checkRol(['evaluador']), deleteFile)

export default router