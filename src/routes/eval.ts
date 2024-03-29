import express from 'express'
const router = express.Router()
import controller from '../controllers/eval'
import authUser from '../middlewares/authUser'
import checkRol from '../middlewares/checkRol'

router
    // nuevos
    .get('/entidad/:id_proyecto', authUser, checkRol(['evaluador', 'admin']), controller.getEntidad)
    .post('/entidad/:id_proyecto', authUser, checkRol(['evaluador']), controller.postEntidad)
    .get('/proposito/:id_proyecto', authUser, checkRol(['evaluador', 'admin']), controller.getProposito)
    .post('/proposito/:id_proyecto', authUser, checkRol(['evaluador']), controller.postProposito)

    .get('/:id_proyecto/respuestas/pdf', authUser, checkRol(['admin']), controller.generatePDF)
    .put('/:id_proyecto/finalizar', authUser, checkRol(['evaluador','admin']), controller.finalizarEvaluacion)

export default router