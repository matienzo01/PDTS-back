const express = require('express')
const router = express.Router()
const controller = require('../controllers/dimensionController')

router
    .get('/', controller.getAllDimensions)
    .get('/:id_dimension', controller.getOneDimension)
    .post('/', controller.createDimension)
    .delete('/:id_dimension', controller.deleteDimension)

module.exports = router