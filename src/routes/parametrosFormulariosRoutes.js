const express = require('express')
const router = express.Router()
const dimensionController = require('../controllers/dimensionController')
const indicatorcontroller = require('../controllers/indicatorController')
const seccionController = require('../controllers/sectionController')
const questionController = require('../controllers/questionController')

router
    .get('/dimensiones', dimensionController.getAllDimensions)
    .get('/dimensiones/:id_dimension', dimensionController.getOneDimension)
    .post('/dimensiones', dimensionController.createDimension)
    .delete('/dimensiones/:id_dimension', dimensionController.deleteDimension)
    .put('/dimensiones/:id_dimension', dimensionController.updateDimension)

    .get('/indicadores', indicatorcontroller.getAllIndicators)
    .get('/indicadores/:id_indicador', indicatorcontroller.getOneIndicator)
    .post('/indicadores', indicatorcontroller.createIndicator)
    .delete('/indicadores/:id_indicador', indicatorcontroller.deleteIndicator)
    .put('/indicadores/:id_indicador', indicatorcontroller.updateIndicator)

    .get('/secciones', seccionController.getAllSecciones)
    .get('/secciones/:id_seccion', seccionController.getOneSeccion)
    .post('/secciones', seccionController.createSeccion)
    .delete('/secciones/:id_seccion', seccionController.deleteSeccion)
    .put('/secciones/:id_seccion', seccionController.updateSeccion)

    .get('/preguntas_encuesta', questionController.getAllQuestions)
    .get('/preguntas_encuesta/:id_pregunta', questionController.getOneQuestion)
    .post('/preguntas_encuesta', questionController.creteQuestion)
    .delete('/preguntas_encuesta/:id_pregunta', questionController.deleteQuestion)
    .put('/preguntas_encuesta/:id_pregunta', questionController.updateQuestion)

module.exports = router