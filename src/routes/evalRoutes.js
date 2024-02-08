const express = require('express')
const router = express.Router()
const controller = require('../controllers/evalController.js')

router
    .get('/', controller.getNextEval)
    .post('/',controller.postEval)

module.exports = router