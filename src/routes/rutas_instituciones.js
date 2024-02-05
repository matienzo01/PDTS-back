const express = require('express')
const router = express.Router()
const controlador = require('../controllers/controlador_instituciones.js')

router
    .get('/', controlador.getAllInstituciones)
    .post('/', controlador.createInstitucion)
    .get('/:id_institucion', controlador.getOneInstitucion)
    .delete('/:id_institucion', controlador.deleteInstitucion)

module.exports = router