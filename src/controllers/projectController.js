const service = require('../services/projectService')

const getAllProjects = async (req,res) => {
    const { params: { id_institucion }} = req

    if (isNaN(id_institucion)) {
        res.status(400).send({
          status: "FAILED",
          data : { error: "Parameter ':id_institucion' should be a number"}
        })
        return ;
    }

    try {
        res.status(200).json(await service.getAllProjects(id_institucion))
    } catch (error) {
        res.status(500).json({error: `Error trying to get all projects`})
    }
}

const getOneProject = async (req,res) => {
    const { params: { id_institucion, id_proyecto }} = req

    if (isNaN(id_institucion)) {
        res.status(400).send({
          status: "FAILED",
          data : { error: "Parameter ':id_institucion' should be a number"}
        })
        return ;
    }

    if (isNaN(id_proyecto)) {
        res.status(400).send({
          status: "FAILED",
          data : { error: "Parameter ':id_proyecto' should be a number"}
        })
        return ;
    }

    try {
        res.status(200).json(await service.getOneProject(id_institucion,id_proyecto))
    } catch (error) {
        res.status(500).json({error: `Error trying to get the project`})
    }
}

const createProject = async (req,res) => {
    const {params: { id_institucion }} = req
    const {proyecto} = req.body

    if (isNaN(id_institucion)) {
        res.status(400).send({
          status: "FAILED",
          data : { error: "Parameter ':id_institucion' should be a number"}
        })
        return ;
    }

    if (!proyecto.titulo ||
        !proyecto.id_director ||
        !proyecto.FechaInicio ||
        !proyecto.FechaFin ||
        !proyecto.area_conocim ||
        !proyecto.subarea_conocim ||
        !proyecto.problema_a_resolver ||
        !proyecto.producto_a_generar ||
        !proyecto.resumen ||
        !proyecto.novedad_u_originalidad ||
        !proyecto.grado_relevancia ||
        !proyecto.grado_pertinencia ||
        !proyecto.grado_demanda ||
        !proyecto.obligatoriedad_proposito ||
        !proyecto.obligatoriedad_opinion) {

            res.status(400).send({
              status: 'FAILED',
              data : { error: "Missing fields"}
            })
            return ;
        }
    
    try {
        res.status(200).json(await service.createProject(id_institucion,proyecto))
    } catch(error) {
        res.status(500).json({error: `Error al crear el proyecto`})
    }
    return;
}

const deleteProject = async (req,res) => {
    const { params: { id_institucion, id_proyecto }} = req

    if (isNaN(id_institucion)) {
        res.status(400).send({
          status: "FAILED",
          data : { error: "Parameter ':id_institucion' should be a number"}
        })
        return ;
    }

    if (isNaN(id_proyecto)) {
        res.status(400).send({
          status: "FAILED",
          data : { error: "Parameter ':id_proyecto' should be a number"}
        })
        return ;
    }







}

module.exports = {
    getAllProjects, 
    getOneProject,
    createProject,
    deleteProject
}