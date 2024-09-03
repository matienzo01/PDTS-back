import express from 'express'
const router = express.Router()
import controller from '../controllers/encuesta'
import authUser from '../middlewares/authUser'
import checkRol from '../middlewares/checkRol'

router
    .get('/promedios', authUser, checkRol(['admin', 'admin general']), controller.getPromedios)
    .get('/:id_proyecto', authUser, checkRol(['evaluador', 'admin', 'admin general']), controller.getEncuesta)
    .post('/:id_proyecto', authUser, checkRol(['evaluador']), controller.postEncuesta)
    .put('/:id_proyecto/finalizar', authUser, checkRol(['evaluador']), controller.finallizarEncuesta)
    
export default router