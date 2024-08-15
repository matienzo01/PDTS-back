import express from 'express'
const router = express.Router()
import authUser from '../middlewares/authUser'
import checkRol from '../middlewares/checkRol'
import modelosEncuesta from '../controllers/modelosEncuesta'

router
    .get('/opciones_encuesta', authUser, checkRol(['admin general']), modelosEncuesta.getAllOptions)

    .post('/modelos', authUser, checkRol(['admin general']), modelosEncuesta.postModelo)
    .get('/modelos', authUser, checkRol(['admin general']), modelosEncuesta.getAllModelos)
    .put('/modelos/:id_modelo/finalizar', authUser, checkRol(['admin general']), modelosEncuesta.finalizarModelo)
    .get('/modelos/:id_modelo', authUser, checkRol(['admin general']), modelosEncuesta.getOneModelo)

    .get('/secciones', authUser, checkRol(['admin general']), modelosEncuesta.getAllSecciones)
    .post('/secciones', authUser, checkRol(['admin general']), modelosEncuesta.createSeccion)
    .get('/secciones/:id_seccion', authUser, checkRol(['admin general']), modelosEncuesta.getOneSeccion)
    .delete('/secciones/:id_seccion', authUser, checkRol(['admin general']), modelosEncuesta.deleteSeccion)

export default router;