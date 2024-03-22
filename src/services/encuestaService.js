const knex = require('../database/knex.js')
const projectService = require('../services/projectService')

const type_and_options = (item, tipos_preguntas, opciones, opciones_x_preguntas) => {
    const tipo_preg = tipos_preguntas[item.id_tipo_pregunta - 1].tipo
    let opciones_item = []
    if (tipo_preg === 'opcion multiple') {
        const ids_opciones = opciones_x_preguntas
            .filter(elemento => elemento.id_preguntas_seccion === item.id_pregunta)
            .map(elemento => elemento.id_opcion)
        
        opciones_item = opciones.filter(item => ids_opciones.includes(item.id));
    }
    return { tipo_preg, opciones_item }
}

const verify_date = async (id_proyecto, id_evaluador) => {
    const assigned = await knex('evaluadores_x_proyectos').select()
        .where({ id_proyecto: id_proyecto, id_evaluador: id_evaluador })
        .first()
    
    if(!assigned) {
        const _error = new Error('The user is not linked to the project')
        _error.status = 403
        throw _error
    }
  
    return assigned
}
  
const getFecha = () => {
    const fecha = new Date()
    return `${fecha.getFullYear()}-${fecha.getMonth() + 1}-${fecha.getDate()}`
}

const generateEncuesta = async(proyecto, respuestas = null) => {
    const [tipos_preguntas, opciones, all_preguntas, opciones_x_preguntas, rel_subpreg, modelo] = await Promise.all([
        knex('tipo_preguntas').select(),
        knex('opciones').select(),
        knex.select(
          'preguntas_seccion.id as id_pregunta',
          'preguntas_seccion.pregunta as enunciado_pregunta',
          'preguntas_seccion.id_seccion',
          'secciones.nombre as nombre_seccion',
          'preguntas_seccion.id_tipo_pregunta'
        )
          .from('preguntas_seccion')
          .leftJoin('secciones', 'preguntas_seccion.id_seccion', 'secciones.id'),
        knex('opciones_x_preguntas').select(),
        knex('relacion_subpregunta').select(),
        knex('modelos_x_secciones').select('id_seccion').where({ id_modelo: proyecto.id_modelo_encuesta})
    ]);

    const transformedResult = [];

    all_preguntas.forEach(item => {
        if (item.id_seccion) {
            const pertenece = modelo.some(seccion => seccion.id_seccion === item.id_seccion);
            if (pertenece) {
                let sectionIndex = transformedResult.findIndex(section => section.sectionId === item.id_seccion);
                if (sectionIndex === -1) {
                    sectionIndex = transformedResult.push({
                        name: item.nombre_seccion.toLowerCase(),
                        sectionId: item.id_seccion,
                        questions: []
                    }) - 1;
                }
            
                const { tipo_preg, opciones_item } = type_and_options(item, tipos_preguntas, opciones, opciones_x_preguntas);

                const question = {
                    questionId: item.id_pregunta,
                    label: item.enunciado_pregunta,
                    type: tipo_preg,
                    options: opciones_item,
                    subQuestions: []
                }

                if(respuestas) {
                    question.respuestas = respuestas.filter(rta => {
                        return rta.id_pregunta === question.questionId;
                    })
                    delete question.respuestas.id_pregunta
                    delete question.respuestas.id_seccion
                }

                transformedResult[sectionIndex].questions.push(question);

            }
        } else {
            const id_padre = rel_subpreg.find(elemento => elemento.id_subpregunta === item.id_pregunta)?.id_pregunta_padre;
            if (id_padre !== undefined) {
                const { tipo_preg, opciones_item } = type_and_options(item, tipos_preguntas, opciones, opciones_x_preguntas);
                
                const subQuestion = {
                    questionId: item.id_pregunta,
                    label: item.enunciado_pregunta,
                    type: tipo_preg,
                    options: opciones_item
                };

                if(respuestas) {
                    subQuestion.respuestas = respuestas.filter(rta => {
                        return rta.id_pregunta === subQuestion.questionId;
                    })
                    delete subQuestion.respuestas.id_pregunta
                    delete subQuestion.respuestas.id_seccion
                }
      
                transformedResult.forEach(section => {
                    const question = section.questions.find(q => q.questionId === id_padre);
                    if (question) {
                        question.subQuestions.push(subQuestion);
                    }
                });
            }
        }
    });

    return { name: 'Encuesta de opinion', sections: transformedResult }
}

const getEncuestaRtas = async(id_proyecto, arrayIdsEvaluadores) => {

    return await knex('respuestas_encuesta as re')
        .join('preguntas_seccion as p', 're.id_pregunta', 'p.id')
        .leftJoin('opciones as o', 're.respuesta', 'o.valor')
        .select('id_evaluador','id_pregunta', 'respuesta', 'o.id as optionId')
        .where({ id_proyecto })
        .whereIn('id_evaluador', arrayIdsEvaluadores)

}

const getIDsNoRespondieron = async(id_proyecto) => {
    const idsNoRespondieron = await knex('evaluadores_x_proyectos')
        .select('id_evaluador')
        .where({ id_proyecto})
        .whereNull('fecha_fin_op')
  
    return idsNoRespondieron.map(objeto => objeto.id_evaluador)
    
  }
  
  const getIDsEvaluadores = async(id_proyecto) => {
    const participantes  = await projectService.getParticipants(id_proyecto)
    const arrayIds = []
    participantes.forEach( async(participante) => {
      arrayIds.push(participante.id)
    })
    return arrayIds
  }

const getEncuesta = async(id_proyecto, id_usuario, rol) => {
    const { proyecto } = await projectService.getOneProject(id_proyecto)
    const assigned = await verify_date(id_proyecto, id_usuario)
  
    if(!proyecto.obligatoriedad_opinion){
        // el mensaje este no va a aparecer, pero lo pono igual
        const _error = new Error('The survey is not applicable for this project')
        _error.status = 204
        throw _error
    }

    if(rol === 'admin'){
        const idsEvaluadores = await getIDsEvaluadores(id_proyecto)
        const idsNoRespondieron = await getIDsNoRespondieron(id_proyecto)
        return await generateEncuesta(proyecto, await getEncuestaRtas(id_proyecto, idsEvaluadores), idsNoRespondieron)
    } else if (assigned.fecha_fin_op !== null) {
        return await generateEncuesta(proyecto, await getEncuestaRtas(id_proyecto, [id_usuario]))
    } else {
        return await generateEncuesta(proyecto)
    }
    
}

const postEncuesta = async(id_proyecto, id_evaluador, rawRespuestas) =>{
    const { proyecto} = await projectService.getOneProject(id_proyecto)

    if(!proyecto.obligatoriedad_opinion){
        // el mensaje este no va a aparecer, pero lo pono igual
        const _error = new Error('The survey is not applicable for this project')
        _error.status = 204
        throw _error
    }

    const assigned = await verify_date(id_proyecto, id_evaluador)

    if(assigned.fecha_fin_eval === null){
        const _error = new Error('You have to complete the project evaluation first')
        _error.status = 409
        throw _error
    }

    if(assigned.fecha_fin_op !== null){
        const _error = new Error('You have already finished the project survey')
        _error.status = 409
        throw _error
    }
        
    return await knex.transaction(async (trx) => {
        const opciones = await trx('opciones').select('valor')
        const valores = opciones.map(objeto => objeto.valor)
        valores.push('si', 'no')

        const rawIdsOpciones = await trx('preguntas_seccion').select('id').whereIn('id_tipo_pregunta', [1, 3])
        const idsOpciones = rawIdsOpciones.map(objeto => objeto.id)

        const respuestas = rawRespuestas.map(rta => {

            if(idsOpciones.includes(rta.id_indicador)){
                if(!valores.includes(rta.answer)) {
                    const _error = new Error(`The answer '${rta.answer}' its not valid option for the question ${rta.id_indicador}`)
                    _error.status = 400
                    throw _error
                }
            }

            return {
                id_pregunta: rta.id_indicador,
                id_evaluador: id_evaluador,
                id_proyecto: id_proyecto,
                respuesta: rta.answer
            }
        })

        await trx('respuestas_encuesta').insert(respuestas)
        await trx('evaluadores_x_proyectos')
            .where({ id_proyecto: id_proyecto, id_evaluador: id_evaluador })
            .update({ fecha_fin_op: getFecha() })

        return { response: 'respuestas de la encuesta del sistema guardadas' }
    })

}


module.exports = {
    getEncuesta,
    postEncuesta
}