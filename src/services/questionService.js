const knex = require('../database/knex.js')
const eval_service = require('../services/evalService.js')

const getAllQuestions = async(sectionId = null) => {
    const { sections } = await eval_service.getProjectSurvey()
    if (sectionId) {
        return sections.filter(section => section.sectionId == sectionId)
    }
    return sections
}

const getOneQuestion = async(id) => {
    const question = await knex('preguntas_seccion').where({id}).first()
    const opciones = await knex('opciones')
        .join('opciones_x_preguntas', 'opciones_x_preguntas.id_opcion', 'opciones.id')
        .select('id_opcion','valor')
        .where({id_preguntas_seccion: question.id})
    if (question.id_seccion === null) {
        delete question.id_seccion
        question.id_padre = (await knex('relacion_subpregunta')
            .select('id_pregunta_padre')
            .where({id_subpregunta: question.id}))[0].id_pregunta_padre
    }
    question.opciones = opciones
    return { question: question }
}

const creteQuestion = async() => {

}

const deleteQuestion = async() => {

}

const updateQuestion = async() => {

}

module.exports = {
    getAllQuestions,
    getOneQuestion,
    creteQuestion,
    deleteQuestion,
    updateQuestion
}