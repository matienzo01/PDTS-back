const express = require('express')
const router = express.Router()
const dimensionController = require('../controllers/dimensionController')
const indicatorcontroller = require('../controllers/indicatorController')

router
    .get('/dimensiones', dimensionController.getAllDimensions)
    .get('/dimensiones/:id_dimension', dimensionController.getOneDimension)
    .post('/dimensiones', dimensionController.createDimension)
    .delete('/dimensiones/:id_dimension', dimensionController.deleteDimension)

    .get('/indicadores', indicatorcontroller.getAllIndicators)
    .get('/indicadores/:id_indicador', indicatorcontroller.getOneIndicator)
    .post('/indicadores', indicatorcontroller.createIndicator)
    .delete('/indicadores/:id_indicador', indicatorcontroller.deleteIndicator)

module.exports = router