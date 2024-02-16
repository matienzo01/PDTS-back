const express = require('express')
const router = express.Router()
const controller = require('../controllers/participatingInstController')

router
    .get('/', controller.getParticipatingInst)
    .get('/:inst_id', controller.getOneParticipatingInst)
    .post('/', controller.createParticipatingInst)

module.exports = router