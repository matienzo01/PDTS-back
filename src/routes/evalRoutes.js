const express = require('express')
const router = express.Router()
const controller = require('../controllers/evalController.js')

router
    .get('/:id_proyecto', controller.getNextEval)
    .get('/:id_pryecto/:id_evaluador', controller.getUserEvaluationAnswers)
    .post('/', controller.postEval)

module.exports = router