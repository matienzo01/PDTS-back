const service = require('../services/userService')

const getAllInstitutionUsers = async(req,res) => {
    const {params: { id_institucion }} = req
    
    if (isNaN(id_institucion)) {
        res.status(400).send({
          status: "FAILED",
          data : { error: "Parameter ':id_institucion' should be a number"}
        })
        return ;
    }

    try {
        res.status(200).json(await service.getAllInstitutionUsers(id_institucion))
    } catch(error) {
        res.status(500).json({error: `Error getting the users from the institution`})
    }
}

const createUser = async(req,res) => {
    const {params: { id_institucion }} = req
    const { type } = req.body
    if (type === 'dni') {

        const { dni } = req.body
        try {
            res.status(200).json(await service.linkUserToInstitution(dni,id_institucion))
        } catch(error) {
            res.status(500).json({error: error.message})
        }

    } else if (type === 'user') {
        const { user } = req.body
        try {
            res.status(200).json(await service.createUser(user,id_institucion))
        } catch(error){
            res.status(500).json({error: error.message})
        }
    } else {
        res.status(400).json({error: 'Bad request'})
    }



    return ;
}

module.exports = {
    getAllInstitutionUsers,
    createUser
}