const service = require('../services/userService')

const getAllInstitutionUsers = async(req,res) => {
    const {params: { id_institucion }} = req

    if (isNaN(id_institucion)) {
        res.status(400).json({ error: "Parameter ':id_institucion' should be a number"})
    }

    try {
        res.status(200).json(await service.getAllInstitutionUsers(id_institucion))
    } catch(_error) {
        const statusCode = _error.status || 500
        res.status(statusCode).json({ error: _error.message})
    }
}

const getUserByDni = async(req,res) => {
    const {params: {id_institucion, dni}} = req

    if (isNaN(dni)) {
        res.status(400).json({ error: "Parameter ':dni' should be a number"})
    }

    try {
        res.status(200).json({usuario: await service.getUserByDni(dni)})
    } catch(_error) {
        const statusCode = _error.status || 500
        res.status(statusCode).json({ error: _error.message})
    }
}

const linkUserToInstitution = async(req,res) => {
    const {params: { id_institucion }} = req
    const { dni } = req.body

    if (isNaN(id_institucion)) {
        res.status(400).json({ error: "Parameter ':id_institucion' should be a number"})
    }

    if (isNaN(dni)) {
        res.status(400).json({ error: "Parameter ':dni' should be a number"})
    }

    try {
        res.status(200).json(await service.linkUserToInstitution(dni,id_institucion))
    } catch(error) {
        const statusCode = error.status || 500
        res.status(statusCode).json({error: error.message})
    }
}

const createUser = async(req,res) => {
    const {params: { id_institucion }} = req
    const { user } = req.body

    if (isNaN(id_institucion)) {
        res.status(400).json({ error: "Parameter ':id_institucion' should be a number"})
    }

    try {
        res.status(200).json(await service.createUser(user,id_institucion))
    } catch(_error){
        const statusCode = _error.status || 500
        res.status(statusCode).json({ error: _error.message})
    }
    return ;
}

module.exports = {
    getAllInstitutionUsers,
    getUserByDni,
    linkUserToInstitution,
    createUser
}