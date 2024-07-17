import express from 'express'
const router = express.Router()
import controller from '../controllers/institution'
import authUser from '../middlewares/authUser'
import checkRol from '../middlewares/checkRol'

router
  .get('/', authUser, checkRol(['admin', 'admin general']), controller.getInstituciones)                       // tested
  .post('/', authUser, checkRol(['admin', 'admin general']), controller.createInstitucion)                     // tested
  .get('/tipos', authUser, checkRol(['admin', 'admin general']), controller.getTiposInstituciones)             // tested
  .get('/rubros', authUser, checkRol(['admin', 'admin general']), controller.getRubros)                        // tested
  .post('/rubros', authUser, checkRol(['admin', 'admin general']), controller.createRubro)                     // tested
  .put('/rubros/:id_rubro', authUser, checkRol(['admin', 'admin general']), controller.updateRubro)            // --
  .delete('/rubros/:id_rubro', authUser, checkRol(['admin', 'admin general']), controller.deleteRubro)         // tested
  .get('/:id_institucion', authUser, checkRol(['admin', 'admin general']), controller.getOneInstitucion)       // tested
  .put('/:id_institucion', authUser, checkRol(['admin', 'admin general']), controller.updateInstitucion)       // --
  .delete('/:id_institucion', authUser, checkRol(['admin', 'admin general']), controller.deleteInstitucion)    // tested
export default router