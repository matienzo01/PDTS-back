const servicio = require('../services/institutionService.js')

const getOneInstitucion = async(req,res) => {
    const { params: { id_institucion }} = req
    
    if (isNaN(id_institucion)) {
      res.status(400).send({
        status: "FAILED",
        data : { error: "Parameter ':id_institucion' should be a number"}
      })
      return ;
    }
    
    try {
        res.status(200).json(await servicio.getOneInstitucion(id_institucion))
      } catch (error) {
        res.status(500).json({error: `Error al obtener la institucion con id ${id_institucion}`})
      }
    return;
}

const getAllInstituciones = async(req,res) => {
    try {
        res.status(200).json(await servicio.getAllInstituciones())
      } catch (error) {
        res.status(500).json({error: 'Error al obtener las instituciones'})
      }
}

const createInstitucion = async(req,res) => {
    const { admin, institucion } = req.body

    if (!admin.nombre ||
      !admin.apellido ||
      !admin.email ||
      !admin.password) {
        res.status(400).send({
          status: 'FAILED',
          data : { error: "Missing fields"}
        })
        return ;
    }

    if (!institucion.id_tipo ||
      !institucion.nombre ||
      !institucion.pais ||
      !institucion.provincia ||
      !institucion.localidad ||
      !institucion.telefono_institucional ||
      !institucion.mail_institucional) {
        res.status(400).send({
          status: 'FAILED',
          data : { error: "Missing fields"}
        })
        return ;
    }

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