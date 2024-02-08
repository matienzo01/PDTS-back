const express = require('express')
const router = express.Router()
const controller = require('../controllers/controlador_instituciones.js')

router
    .get('/', controller.getAllInstituciones)
    .get('/:id_institucion', controller.getOneInstitucion)
    .get('/:id_institucion/proyectos', controlador.getOneInstitucion)
    .get('/:id_institucion/proyectos/:id_proyecto', controlador.getOneInstitucion)

    .post('/', controller.createInstitucion)
    .post('/:id_institucion/proyectos', controlador.getOneInstitucion)

    .delete('/:id_institucion', controller.deleteInstitucion)
    .delete('/:id_institucion/proyectos/:id_proyecto', controlador.getOneInstitucion)

module.exports = router