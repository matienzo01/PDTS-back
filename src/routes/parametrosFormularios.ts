import express from 'express'
const router = express.Router()
import dimensionController from '../controllers/dimension'/*
const indicatorcontroller = require('../controllers/indicatorController')/*
const seccionController = require('../controllers/sectionController')/*
const questionController = require('../controllers/questionController')*/
import authUser from '../middlewares/authUser'
import checkRol from '../middlewares/checkRol'

router

    .get('/dimensiones', authUser, checkRol(['admin general']), dimensionController.getAllDimensions)
    .get('/dimensiones/:id_dimension', authUser, checkRol(['admin general']), dimensionController.getOneDimension)
    .post('/dimensiones', authUser, checkRol(['admin general']), dimensionController.createDimension)
    .delete('/dimensiones/:id_dimension', authUser, checkRol(['admin general']), dimensionController.deleteDimension)
    .put('/dimensiones/:id_dimension', authUser, checkRol(['admin general']), dimensionController.updateDimension)

/*
    .get('/indicadores', authUser, checkRol(['admin general']), indicatorcontroller.getAllIndicators)
    .get('/indicadores/:id_indicador', authUser, checkRol(['admin general']), indicatorcontroller.getOneIndicator)
    .post('/indicadores', authUser, checkRol(['admin general']), indicatorcontroller.createIndicator)
    .delete('/indicadores/:id_indicador', authUser, checkRol(['admin general']), indicatorcontroller.deleteIndicator)
    .put('/indicadores/:id_indicador', authUser, checkRol(['admin general']), indicatorcontroller.updateIndicator)
/*
    .get('/secciones', authUser, checkRol(['admin general']), seccionController.getAllSecciones)
    .get('/secciones/:id_seccion', authUser, checkRol(['admin general']), seccionController.getOneSeccion)
    .post('/secciones', authUser, checkRol(['admin general']), seccionController.createSeccion)
    .delete('/secciones/:id_seccion', authUser, checkRol(['admin general']), seccionController.deleteSeccion)
    .put('/secciones/:id_seccion', authUser, checkRol(['admin general']), seccionController.updateSeccion)
/*
    .get('/preguntas_encuesta', authUser, checkRol(['admin general']), questionController.getAllQuestions)
    .get('/preguntas_encuesta/:id_pregunta', authUser, checkRol(['admin general']), questionController.getOneQuestion)
    .post('/preguntas_encuesta', authUser, checkRol(['admin general']), questionController.creteQuestion)
    .delete('/preguntas_encuesta/:id_pregunta', authUser, checkRol(['admin general']), questionController.deleteQuestion)
    .put('/preguntas_encuesta/:id_pregunta', authUser, checkRol(['admin general']), questionController.updateQuestion)
*/
export default router;