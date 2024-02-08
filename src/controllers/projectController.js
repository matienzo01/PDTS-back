const service = require('../services/projectService')

const getAllProjects = async (req,res) => {
    const { params: { id_institucion }} = req
}

const getOneProject = async (req,res) => {
    const { params: { id_institucion, id_proyecto }} = req

}

const createProject = async (req,res) => {
    const { params: { id_institucion }} = req

}

const deleteProject = async (req,res) => {
    const { params: { id_institucion, id_proyecto }} = req

}

module.exports = {
    getAllProjects, 
    getOneProject,
    createProject,
    deleteProject
}