const express = require('express')
const router = express.Router()
const controller = require('../controllers/institutionController')

router
    .get('/', controller.getInstituciones)
    .get('/:inst_id', controller.getOneInstitucion)
    .post('/', controller.createInstitucion)

module.exports = router