const express = require('express')
const router = express.Router()
const user_controller = require('../controllers/userController.js')
const project_controller = require('../controllers/projectController.js')
const authUser = require('../middlewares/authUser.js')
const checkRol = require('../middlewares/checkRol.js')

router
  .get('/', authUser, checkRol(['admin general']), user_controller.getAllUsers)
  .get('/:dni', authUser, checkRol(['evaluador', 'admin', 'admin general']), user_controller.getUserByDni)
  .get('/:id_usuario/proyectos', authUser, checkRol(['evaluador', 'admin', 'admin general']), project_controller.getProjectsByUser)
  .put('/:id_usuario', authUser, checkRol(['evaluador']), user_controller.updateUser)

module.exports = router