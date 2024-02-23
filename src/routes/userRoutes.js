const express = require('express')
const router = express.Router()
const user_controller = require('../controllers/userController.js')
const project_controller = require('../controllers/projectController.js')


router
  .get('/:dni', user_controller.getUserByDni)
  .get('/:id_usuario/proyectos', project_controller.getProjectsByUser)


module.exports = router