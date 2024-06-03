import knex from '../database/knex';
import projectService from '../services/project';
import { CustomError } from '../types/CustomError';
import { Participante } from '../types/Participante';
import { Proyecto } from '../types/Proyecto';
import { RespuestaEncuesta } from '../types/RespuestaEncuesta';

const type_and_options = (
    item: any, 
    tipos_preguntas: {id: number; tipo: string}[], 
    opciones: {id: number; valor: string}[], 
    opciones_x_preguntas: {id_opcion: number; id_preguntas_seccion: number}[]) => 
    {
        const tipo_preg = tipos_preguntas[item.id_tipo_pregunta - 1].tipo
        let opciones_item: {id: number; valor: string}[] = []
        if (tipo_preg === 'opcion multiple') {
            const ids_opciones = opciones_x_preguntas
                .filter(elemento => elemento.id_preguntas_seccion === item.id_pregunta)
                .map(elemento => elemento.id_opcion)
            
            opciones_item = opciones.filter(item => ids_opciones.includes(item.id));
        }
        return { tipo_preg, opciones_item }
}
  
const getFecha = () => {
    const fecha = new Date()
    return `${fecha.getFullYear()}-${fecha.getMonth() + 1}-${fecha.getDate()}`
}

const generateEncuesta = async(proyecto: Proyecto, rol: string, respuestas: RespuestaEncuesta[] | null = null, idsNoRespondieron: number[] | null = null) => {
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

    const transformedResult: any = [];

    all_preguntas.forEach(item => {
        if (item.id_seccion) {
            const pertenece = modelo.some(seccion => seccion.id_seccion === item.id_seccion);
            if (pertenece) {
                let sectionIndex = transformedResult.findIndex((section: any) => section.sectionId === item.id_seccion);
                if (sectionIndex === -1) {
                    sectionIndex = transformedResult.push({
                        name: item.nombre_seccion,
                        sectionId: item.id_seccion,
                        questions: []
                    }) - 1;
                }
            
                const { tipo_preg, opciones_item } = type_and_options(item, tipos_preguntas, opciones, opciones_x_preguntas);

                const question: any = {
                    questionId: item.id_pregunta,
                    label: item.enunciado_pregunta,
                    type: tipo_preg,
                    options: opciones_item,
                    subQuestions: []
                }

                if(respuestas?.length) {
                    const rtasFiltradas = respuestas
                        .filter(rta => { return rta.id_pregunta === question.questionId;})
                        .map(({ id_evaluador, respuesta, optionId }) => ({ id_evaluador, respuesta, optionId }));
                    if(rtasFiltradas.length) {
                        question.respuestas = rtasFiltradas
                    }
                }

                transformedResult[sectionIndex].questions.push(question);

            }
        } else {
            const id_padre = rel_subpreg.find(elemento => elemento.id_subpregunta === item.id_pregunta)?.id_pregunta_padre;
            if (id_padre !== undefined) {
                const { tipo_preg, opciones_item } = type_and_options(item, tipos_preguntas, opciones, opciones_x_preguntas);
                
                const subQuestion: any = {
                    questionId: item.id_pregunta,
                    label: item.enunciado_pregunta,
                    type: tipo_preg,
                    options: opciones_item
                };

                if(respuestas?.length) {
                    const rtasFiltradas = respuestas
                        .filter(rta => { return rta.id_pregunta === subQuestion.questionId;})
                        .map(({ id_evaluador, respuesta, optionId }) => ({ id_evaluador, respuesta, optionId }));
                    if(rtasFiltradas.length){
                        subQuestion.respuestas = rtasFiltradas
                    }
                }
      
                transformedResult.forEach((section: any) => {
                    const question = section.questions.find((q: any) => q.questionId === id_padre);
                    if (question) {
                        question.subQuestions.push(subQuestion);
                    }
                });
            }
        }
    });

    
    if(rol == 'admin general' && idsNoRespondieron) {
        const respuestasVacias: RespuestaEncuesta[]  = idsNoRespondieron.map(id => ({
            id_evaluador: id,
            respuesta: null,
            optionId: null
        }));
        
        transformedResult.forEach((result: any) => {
            result.questions.forEach((question: any) => {
                question.respuestas = question.respuestas ? [...question.respuestas, ...respuestasVacias] : respuestasVacias;
                question.subQuestions.forEach((subQuestion: any) => {
                    subQuestion.respuestas = subQuestion.respuestas ? [...subQuestion.respuestas, ...respuestasVacias] : respuestasVacias;
                });
            });
        });
      }

    return { name: 'Encuesta del Sistema', sections: transformedResult }
}

const getEncuestaRtas = async(id_proyecto: number, arrayIdsEvaluadores: number[], rol: string) => {

    let query = knex('respuestas_encuesta as re')
        .join('preguntas_seccion as p', 're.id_pregunta', 'p.id')
        .leftJoin('opciones as o', 're.respuesta', 'o.valor')
        .select('re.id_evaluador','id_pregunta', 'respuesta', 'o.id as optionId')
        .where('re.id_proyecto', id_proyecto)
        .whereIn('re.id_evaluador', arrayIdsEvaluadores)

    if( rol == 'admin general') {
        query = query
            .join('evaluadores_x_proyectos as ep', 're.id_proyecto', 'ep.id_proyecto')
            .whereNotNull('ep.fecha_fin_op');
    } 

    return await query
}

const getIDsNoRespondieron = async(id_proyecto: number) => {
    const idsNoRespondieron = await knex('evaluadores_x_proyectos')
        .select('id_evaluador')
        .where({ id_proyecto})
        .whereNull('fecha_fin_op')
  
    return idsNoRespondieron.map(objeto => objeto.id_evaluador)
    
  }
  
  const getIDsEvaluadores = async(id_proyecto: number) => {
    const participantes: Participante[]  = await projectService.getParticipants(id_proyecto)
    const arrayIds: number[] = []
    participantes.forEach( async(participante) => {
      arrayIds.push(participante.id)
    })
    return arrayIds
  }

const getEncuesta = async(id_proyecto: number, id_usuario: number, rol: string) => {
    const { proyecto } = await projectService.getOneProject(id_proyecto)
  
    if(!proyecto.obligatoriedad_opinion){
        // el mensaje este no va a aparecer, pero lo pono igual
        throw new CustomError('The survey is not applicable for this project', 204)
    }

    if(rol === 'admin general'){
        const idsEvaluadores: number[] = await getIDsEvaluadores(id_proyecto)
        const idsNoRespondieron: number[] = await getIDsNoRespondieron(id_proyecto)
        return await generateEncuesta(proyecto, rol, await getEncuestaRtas(id_proyecto, idsEvaluadores, rol), idsNoRespondieron)
    } else {
        await projectService.verify_date(id_proyecto, id_usuario)
        return await generateEncuesta(proyecto, rol, await getEncuestaRtas(id_proyecto, [id_usuario], rol))
    }
    
}

const canAnswer = async(id_proyecto: number, id_evaluador: number) => {
    const { proyecto} = await projectService.getOneProject(id_proyecto)

    if(!proyecto.obligatoriedad_opinion){
        // el mensaje este no va a aparecer, pero lo pongo igual
        throw new CustomError('The survey is not applicable for this project', 204)
    }

    const assigned = await projectService.verify_date(id_proyecto, id_evaluador)

    if(assigned.fecha_fin_eval == null){
        throw new CustomError('You have to complete the project evaluation first', 409)
    }

    if(assigned.fecha_fin_op != null){
        throw new CustomError('You have already finished the project survey', 409)
    }
}

const postEncuesta = async(id_proyecto: number, id_evaluador: number, rawRespuestas: {id_indicador: number; answer: string}[]) =>{
    await canAnswer(id_proyecto, id_evaluador)
        
    await knex.transaction(async (trx) => {

        const opciones = await trx('opciones').select('valor')
        const valores = opciones.map(objeto => objeto.valor)
        valores.push('si', 'no')

        const rawIdsOpciones = await trx('preguntas_seccion').select('id').whereIn('id_tipo_pregunta', [1, 3])
        const idsOpciones = rawIdsOpciones.map(objeto => objeto.id)

        const respuestas = rawRespuestas.map(rta => {

            if(idsOpciones.includes(rta.id_indicador)){
                if(!valores.includes(rta.answer)) {
                    throw new CustomError(`The answer '${rta.answer}' its not valid option for the question ${rta.id_indicador}`, 400)
                }
            }

            return {
                id_pregunta: rta.id_indicador,
                id_evaluador: id_evaluador,
                id_proyecto: id_proyecto,
                respuesta: rta.answer
            }
        })

        respuestas.forEach(async(rta) => {
            try {
              await knex('respuestas_encuesta').insert(rta);
            } catch (error) {
              if ((error as any).code === 'ER_DUP_ENTRY') { 
                await knex('respuestas_encuesta')
                  .where({id_pregunta: rta.id_pregunta})
                  .where({id_evaluador: rta.id_evaluador})
                  .where({id_proyecto: rta.id_proyecto})
                  .update(rta);
              } else {
                throw error
              }
            }
          })

    })

}

const finallizarEncuesta = async(id_proyecto: number, id_usuario: number) => {
    await canAnswer(id_proyecto, id_usuario)
    
    const [preguntas, respuestas] = await Promise.all([
        knex('preguntas_seccion')
            .count('* as cantidad')
            .first(),
        knex('respuestas_encuesta')
            .count('* as cantidad')
            .where({id_evaluador: id_usuario})
            .where({id_proyecto})
            .first()
    ])

    if (respuestas == undefined || preguntas == undefined) {
        throw new CustomError('Internal server Error', 500)
    }

    if(preguntas.cantidad != respuestas.cantidad) {
        throw new CustomError('The amount of answers does not match those expected', 400)
    }
    
    await knex('evaluadores_x_proyectos')
        .where({ id_proyecto: id_proyecto, id_evaluador: id_usuario })
        .update({ fecha_fin_op: getFecha() })

    return await getEncuesta(id_proyecto, id_usuario, 'evaluador')
}


export default {
    getEncuesta,
    postEncuesta,
    finallizarEncuesta
}