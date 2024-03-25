const express = require('express')
const router = express.Router()
const controller = require('../controllers/evalController.js')
const authUser = require('../middlewares/authUser.js')
const checkRol = require('../middlewares/checkRol.js')

router
    // nuevos
    .get('/entidad/:id_proyecto', authUser, checkRol(['evaluador', 'admin']), controller.getEntidad)
    .post('/entidad/:id_proyecto', authUser, checkRol(['evaluador']), controller.postEntidad)
    .get('/proposito/:id_proyecto', authUser, checkRol(['evaluador', 'admin']), controller.getProposito)
    .post('/proposito/:id_proyecto', authUser, checkRol(['evaluador']), controller.postProposito)

    .get('/:id_proyecto/respuestas/pdf', authUser, checkRol(['admin']), controller.generatePDF)
    .put('/:id_proyecto/finalizar', authUser, checkRol(['admin']), controller.finalizarEvaluacion)

module.exports = router