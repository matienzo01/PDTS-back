const express = require('express')
const router = express.Router()
const institution_controller = require('../controllers/institutionController.js')
const project_controller = require('../controllers/projectController.js')
const user_controller = require('../controllers/userController.js')

router
  .get('/', institution_controller.getAllInstituciones)
  .get('/roles', institution_controller.getAllRoles)
  .get('/:id_institucion', institution_controller.getOneInstitucion)
  .get('/:id_institucion/proyectos', project_controller.getAllProjects)
  .get('/:id_institucion/proyectos/:id_proyecto', project_controller.getOneProject)
  .get('/:id_institucion/usuarios', user_controller.getAllInstitutionUsers)
  .get('/:id_institucion/usuarios/:dni', user_controller.getUserByDni)

  .post('/', institution_controller.createInstitucion)
  .post('/:id_institucion/proyectos', project_controller.createProject)
  .post('/:id_institucion/usuarios', user_controller.createUser)

  .delete('/:id_institucion', institution_controller.deleteInstitucion)
  .delete('/:id_institucion/proyectos/:id_proyecto', project_controller.deleteProject)

module.exports = router