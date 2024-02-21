const express = require('express')
const router = express.Router()
const institution_controller = require('../controllers/institutionCYTController.js')
const project_controller = require('../controllers/projectController.js')
const user_controller = require('../controllers/userController.js')

router
  .get('/', institution_controller.getAllInstitucionesCYT)
  .get('/tipos', institution_controller.getTiposInstituciones)
  .get('/:id_institucion', institution_controller.getOneInstitucionCYT)
  .get('/:id_institucion/proyectos', project_controller.getAllProjects)
  .get('/:id_institucion/proyectos/:id_proyecto', project_controller.getOneProject)
  .get('/:id_institucion/proyectos/:id_proyecto/evaluadores', project_controller.getParticipants)
  .get('/:id_institucion/usuarios', user_controller.getAllInstitutionUsers)
  .get('/:id_institucion/usuarios/:dni', user_controller.getUserByDni)

  .post('/', institution_controller.createInstitucionCYT)
  .post('/:id_institucion/proyectos', project_controller.createProject)
  .post('/:id_institucion/proyectos/:id_proyecto/evaluadores', project_controller.assignEvaluador)
  .post('/:id_institucion/usuarios', user_controller.createUser)
  .post('/:id_institucion/usuarios/vincular_usuario', user_controller.linkUserToInstitution)

  .delete('/:id_institucion', institution_controller.deleteInstitucionCYT)
  .delete('/:id_institucion/proyectos/:id_proyecto', project_controller.deleteProject)
  .delete('/:id_institucion/proyectos/:id_proyecto/evaluadores/:id_evaluador', project_controller.unassignEvaluador)

module.exports = router