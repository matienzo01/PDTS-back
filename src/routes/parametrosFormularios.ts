import express from 'express'
const router = express.Router()
import authUser from '../middlewares/authUser'
import checkRol from '../middlewares/checkRol'
import modelosEncuesta from '../controllers/modelosEncuesta'

router
    .get('/modelos/:id_modelo', authUser, checkRol(['admin general']), modelosEncuesta.getOneModelo)
    .get('/secciones/:id_seccion', authUser, checkRol(['admin general']), modelosEncuesta.getOneSeccion)
    .get('/secciones', authUser, checkRol(['admin general']), modelosEncuesta.getAllSecciones)
    .post('/secciones', authUser, checkRol(['admin general']), modelosEncuesta.createSeccion)

export default router;