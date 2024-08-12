import express from 'express'
const router = express.Router()
import authUser from '../middlewares/authUser'
import checkRol from '../middlewares/checkRol'
import modelosEncuesta from '../controllers/modelosEncuesta'

router
    .get('/opciones_encuesta', authUser, checkRol(['admin general']), modelosEncuesta.getAllOptions)
    .get('/modelos', authUser, checkRol(['admin general']), modelosEncuesta.getAllModelos)
    .get('/modelos/:id_modelo', authUser, checkRol(['admin general']), modelosEncuesta.getOneModelo)
    .get('/secciones/:id_seccion', authUser, checkRol(['admin general']), modelosEncuesta.getOneSeccion)
    .delete('/secciones/:id_seccion', authUser, checkRol(['admin general']), modelosEncuesta.deleteSeccion)
    .get('/secciones', authUser, checkRol(['admin general']), modelosEncuesta.getAllSecciones)
    .post('/secciones', authUser, checkRol(['admin general']), modelosEncuesta.createSeccion)

export default router;