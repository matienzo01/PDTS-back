const express = require('express')
const router = express.Router()
const controller = require('../controllers/evalController.js')
const authUser = require('../middlewares/authUser.js')

router
    .get('/:id_proyecto', authUser, controller.getNextEval)
    .get('/:id_proyecto/respuestas', controller.getUserEvaluationAnswers)
    .post('/', authUser, controller.postEval)

module.exports = router