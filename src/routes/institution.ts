import express from 'express'
const router = express.Router()
import controller from '../controllers/institution'
import authUser from '../middlewares/authUser'
import checkRol from '../middlewares/checkRol'

router
  .get('/', authUser, checkRol(['admin', 'admin general']), controller.getInstituciones)
  .post('/', authUser, checkRol(['admin', 'admin general']), controller.createInstitucion)


  .get('/tipos', authUser, checkRol(['admin', 'admin general']), controller.getTiposInstituciones)

  .get('/rubros', authUser, checkRol(['admin', 'admin general']), controller.getRubros)
  .post('/rubros', authUser, checkRol(['admin', 'admin general']), controller.createRubro)
  .put('/rubros/:id_rubro', authUser, checkRol(['admin', 'admin general']), controller.updateRubro)
  .delete('/rubros/:id_rubro', authUser, checkRol(['admin', 'admin general']), controller.deleteRubro)

  .get('/:inst_id', authUser, checkRol(['admin', 'admin general']), controller.getOneInstitucion)
  .put('/:inst_id', authUser, checkRol(['admin', 'admin general']), controller.updateInstitucion)
export default router