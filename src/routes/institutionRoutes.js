const express = require('express')
const router = express.Router()
const institution_controller = require('../controllers/institutionController.js')
const project_controller = require('../controllers/projectController.js')

router
    .get('/', institution_controller.getAllInstituciones)
    .get('/:id_institucion', institution_controller.getOneInstitucion)
    .get('/:id_institucion/proyectos', project_controller.getAllProjects)
    .get('/:id_institucion/proyectos/:id_proyecto', project_controller.getOneProject)

    .post('/', institution_controller.createInstitucion)
    .post('/:id_institucion/proyectos', project_controller.createProject)

    .delete('/:id_institucion', institution_controller.deleteInstitucion)
    .delete('/:id_institucion/proyectos/:id_proyecto', project_controller.deleteProject)

module.exports = router