const express = require('express')
const router = express.Router()
const controlador = require('../controllers/controlador_dimensiones')

router
    .get('/', controlador.getAllDimensiones)
    .get('/:id_dimension', controlador.getOneDimensiones)
    .post('/', controlador.createDimensiones)
    .delete('/:id_dimension', controlador.deleteDimensiones)
    .put('/:id_dimension', controlador.updateDimensiones)

module.exports = router