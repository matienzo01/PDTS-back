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

    }
}

const createUser = async(req,res) => {
    const {params: { id_institucion }} = req



    return ;
}

module.exports = {
    getAllInstitutionUsers,
    createUser
}