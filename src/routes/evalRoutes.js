const express = require('express')
const router = express.Router()
const controller = require('../controllers/evalController.js')
const authUser = require('../middlewares/authUser.js')
const checkRol = require('../middlewares/checkRol.js')

router
    .get('/:id_proyecto', authUser, checkRol(['evaluador']), controller.getNextEval)
    .get('/:id_proyecto/respuestas', authUser, checkRol(['evaluador','admin']), controller.getUserEvaluationAnswers)
    .get('/:id_proyecto/respuestas/pdf', authUser, checkRol(['admin']), controller.generatePDF)
    .post('/', authUser, checkRol(['evaluador']), controller.postEval)

module.exports = router