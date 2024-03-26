const service = require('../services/questionService')

const getAllQuestions = async(req, res) => {

    const {id_seccion} = req.query

    try {
        res.status(200).json(await service.getAllQuestions(id_seccion))
    } catch(error){
        const statusCode = error.status || 500
        res.status(statusCode).json({ error: error.message})
    }
}

const getOneQuestion = async(req, res) => {
    const { params: { id_pregunta }} = req

    try {
        res.status(200).json(await service.getOneQuestion(id_pregunta))
    } catch(error){
        const statusCode = error.status || 500
        res.status(statusCode).json({ error: error.message})
    }

}

const creteQuestion = async(req, res) => {
    const { pregunta } = req.body

    try {
        res.status(200).json(await service.creteQuestion(pregunta))
    } catch(error){
        const statusCode = error.status || 500
        res.status(statusCode).json({ error: error.message})
    }
}

const deleteQuestion = async(req, res) => {

}

const updateQuestion = async(req, res) => {

}

export default {
    getAllQuestions,
    getOneQuestion,
    creteQuestion,
    deleteQuestion,
    updateQuestion
}