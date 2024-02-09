const servicio = require('../services/institutionService.js')

const getOneInstitucion = async(req,res) => {
    const { params: { id_institucion }} = req

    if (!id_institucion) return;
    
    try {
        res.status(200).json(await servicio.getOneInstitucion(id_institucion))
      } catch (error) {
        console.error(`Error al obtener la institucion con id ${id_institucion}`, error)
        res.status(500).json({error: 'Error'})
      }
    return;
}

const getAllInstituciones = async(req,res) => {
    
    try {
        const instituciones = await servicio.getAllInstituciones()
        res.status(200).json({instituciones})
      } catch (error) {
        console.error('Error al obtener las instituciones', error)
        res.status(500).json({error: 'Error'})
      }
}

const createInstitucion = async(req,res) => {
    const { admin, institucion } = req.body
    try {
        res.status(200).json(await servicio.createInstitucion(admin,institucion))
    } catch(error) {

    }
    return;
}

const deleteInstitucion = async(req,res) => {
    
    return;
}

module.exports = {
    getOneInstitucion,
    getAllInstituciones,
    createInstitucion,
    deleteInstitucion
}