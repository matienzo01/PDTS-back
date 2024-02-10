const express = require('express')
const router = express.Router()
const controller = require('../controllers/indicatorController')

router
    .get('/', controller.getAllIndicators)
    .get('/:id_indicador', controller.getOneIndicator)
    .post('/', controller.createIndicator)
    .delete('/:id_indicador', controller.deleteIndicator)

module.exports = router