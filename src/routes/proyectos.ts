import express from 'express'
const router = express.Router()
import project_controller from '../controllers/project'
import authUser from '../middlewares/authUser'
import checkRol from '../middlewares/checkRol'

router
  .get('/', authUser, checkRol(['admin general']), project_controller.getAllProjects)

export default router