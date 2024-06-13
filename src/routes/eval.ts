import express from 'express'
const router = express.Router()
import controller from '../controllers/eval'
import authUser from '../middlewares/authUser'
import checkRol from '../middlewares/checkRol'

/*
import renameFile from '../middlewares/renameFile'
import { uploadFile, getFiles } from '../controllers/uploadFiles';
import { upload } from '../services/Files';*/

router
    .get('/entidad/:id_proyecto', authUser, checkRol(['evaluador', 'admin']), controller.getEntidad)
    .get('/proposito/:id_proyecto', authUser, checkRol(['evaluador', 'admin']), controller.getProposito)
    .post('/form/:id_proyecto', authUser, checkRol(['evaluador']), controller.saveForm)

    .get('/:id_proyecto/respuestas/pdf', authUser, checkRol(['admin']), controller.generatePDF)
    .put('/:id_proyecto/finalizar', authUser, checkRol(['evaluador','admin']), controller.finalizarEvaluacion)

    /*
    .post('/form/:id_proyecto/files', (req, res, next) => {
        upload.single('file')(req, res, (err) => {
            if (err) {
              return res.status(400).send({ error: err.message });
            }
            next();
        });
    }, authUser, checkRol(['evaluador']), renameFile ,uploadFile)

    .get('/form/:id_proyecto/files', authUser, checkRol(['evaluador','admin']), getFiles)*/

export default router