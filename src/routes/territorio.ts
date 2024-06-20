import express from 'express'
const router = express.Router()
import authUser from '../middlewares/authUser'
import checkRol from '../middlewares/checkRol'
import controller from '../controllers/territorio'

router
  .get('/paises', authUser, checkRol(['admin', 'admin general']), controller.getPaises)
  .get('/provincias', authUser, checkRol(['admin','admin general']), controller.getProvincias)
  .get('/localidades', authUser, checkRol(['admin','admin general']), controller.getAllLocalidades)
  .get('/:id_provincia/localidades', authUser, checkRol(['admin general']), controller.getLocalidades)

export default router