import { Knex } from 'knex';
import knex from '../database/knex'
//import eval_service from '../services/evalService.js'
import { Question } from '../types/Question';


const getAllQuestions = async(sectionId: number | null = null) => {/*
    const { sections } = await eval_service.getProjectSurvey()
    if (sectionId) {
        return sections.filter(section => section.sectionId == sectionId)
    }
    return sections*/
}

const getOneQuestion = async(id: number, trx: Knex.Transaction | null = null) => {
    const queryBuilder = trx || knex
    const question = await queryBuilder('preguntas_seccion').where({id}).first()
    const opciones = await queryBuilder('opciones')
        .join('opciones_x_preguntas', 'opciones_x_preguntas.id_opcion', 'opciones.id')
        .select('id_opcion','valor')
        .where({id_preguntas_seccion: question.id})
    if (question.id_seccion === null) {
        delete question.id_seccion
        question.id_padre = (await queryBuilder('relacion_subpregunta')
            .select('id_pregunta_padre')
            .where({id_subpregunta: question.id}))[0].id_pregunta_padre
    }
    question.opciones = opciones
    return { question: question }
}

const creteQuestion = async(questionData: Question) => {
    return knex.transaction( async(trx: Knex.Transaction) => {
        const newQuestion: Partial<Question> = {
            pregunta: questionData.pregunta,
            id_seccion: questionData.id_seccion,
            id_tipo_pregunta: questionData.id_tipo_pregunta
        }

        const insertId = (await trx('preguntas_seccion').insert(newQuestion))[0];

        if (!questionData.id_seccion) { // es subpregunta
            await trx('relacion_subpregunta').insert({ 
                id_pregunta_padre: questionData.id_padre, 
                id_subpregunta: insertId 
            })
        }

        if (questionData.id_tipo_pregunta == 1 && questionData.opciones) { // opcion multiple
            questionData.opciones.forEach(async(opcion) => {
                await trx('opciones_x_preguntas').insert({ 
                    id_opcion: opcion.id_opcion, 
                    id_preguntas_seccion: insertId
                })
            });
        }

        return await getOneQuestion(insertId, trx)
    })
}

const deleteQuestion = async() => {

}

const updateQuestion = async() => {

}

export default {
    getAllQuestions,
    getOneQuestion,
    creteQuestion,
    deleteQuestion,
    updateQuestion
}