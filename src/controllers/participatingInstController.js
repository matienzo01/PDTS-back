const service = require('../services/participatingInstService.js')

const getParticipatingInst = async(req,res) => {
    try{ 
        res.status(200).json(await service.getParticipatingInst())
    } catch (error) {
        const statusCode = error.status || 500
        res.status(statusCode).json({error: error.message})
    }
}   

const getOneParticipatingInst = async(req,res) => {
    const { params: { inst_id }} = req

    if (isNaN(inst_id)) {
        res.status(400).json({ error: "Parameter ':inst_id' should be a number"})
        return ;
    }

    try {
        res.status(200).json(await service.getOneParticipatingInst(inst_id))
    } catch (error) {
        const statusCode = error.status || 500
        res.status(statusCode).json({error: error.message})
    }
}

const createParticipatingInst = async(req,res) => {
    const { institucion } = req.body

    if (
        !institucion.nombre ||
        !institucion.pais||
        !institucion.provincia||
        !institucion.localidad||
        !institucion.rubro||
        !institucion.telefono_institucional||
        !institucion.mail_institucional) {
            res.status(400).json({ error: "Missing fields"})
    }

    try{ 
        res.status(200).json(await service.createParticipatingInst(institucion))
    } catch (error) {
        const statusCode = error.status || 500
        res.status(statusCode).json({error: error.message})
    }
}  

module.exports = {
    getParticipatingInst,
    getOneParticipatingInst,
    createParticipatingInst
}