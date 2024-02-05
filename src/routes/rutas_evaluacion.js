const express = require('express')
const router = express.Router()
const controlador = require('../controllers/controlador_evaluacion.js')

router
    .get('/', controlador.getEvaluacion)
    .post('/',controlador.postEvaluacion)

module.exports = router