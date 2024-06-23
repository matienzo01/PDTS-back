import express from 'express'
const router = express.Router()
import user_controller from '../controllers/user'
import project_controller from '../controllers/project'
import authUser from '../middlewares/authUser'
import checkRol from '../middlewares/checkRol'

router
  .get('/', authUser, checkRol(['admin general']), user_controller.getAllUsers)
  .get('/:dni', authUser, checkRol(['evaluador', 'admin', 'admin general']), user_controller.getUserByDni)
  .get('/administradores/:id_admin', authUser, checkRol(['admin', 'admin general']), user_controller.getOneAdmin)
  .get('/:id_usuario/proyectos', authUser, checkRol(['evaluador', 'admin', 'admin general']), project_controller.getProjectsByUser)
  .put('/:id_usuario', authUser, checkRol(['evaluador']), user_controller.updateUser)

export default router