const express = require('express')
const router = express.Router()
const controller = require('../controllers/encuestaController.js')
const authUser = require('../middlewares/authUser.js')
const checkRol = require('../middlewares/checkRol.js')

router
    .get('/:id_proyecto', authUser, checkRol(['evaluador', 'admin']), controller.getEncuesta)
    .post('/:id_proyecto', authUser, checkRol(['evaluador']), controller.postEncuesta)

module.exports = router