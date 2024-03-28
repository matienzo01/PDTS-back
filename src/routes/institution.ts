import express from 'express'
const router = express.Router()
import controller from '../controllers/institution'
import authUser from '../middlewares/authUser'
import checkRol from '../middlewares/checkRol'

router
  .get('/', authUser, checkRol(['admin', 'admin general']), controller.getInstituciones)
  .get('/:inst_id', authUser, checkRol(['admin', 'admin general']), controller.getOneInstitucion)
  .post('/', authUser, checkRol(['admin', 'admin general']), controller.createInstitucion)

export default router