const express = require('express')
const router = express.Router()
const controller = require('../controllers/institutionController')
const authUser = require('../middlewares/authUser.js')
const checkRol = require('../middlewares/checkRol.js')

router
    .get('/',authUser, checkRol(['admin']), controller.getInstituciones)
    .get('/:inst_id',authUser, checkRol(['admin']), controller.getOneInstitucion)
    .post('/', authUser, checkRol(['admin']), controller.createInstitucion)

module.exports = router