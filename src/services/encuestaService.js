const knex = require('../database/knex.js')
const projectService = require('../services/projectService')

const type_and_options = (item, tipos_preguntas, opciones, opciones_x_preguntas) => {
    const tipo_preg = tipos_preguntas[item.id_tipo_pregunta - 1].tipo
    let opciones_item = []
    if (tipo_preg === 'opcion multiple') {
      const ids_opciones = opciones_x_preguntas
        .filter(elemento => elemento.id_preguntas_seccion === item.id_pregunta)
        .map(elemento => elemento.id_opcion)
  
      opciones_item = opciones
        .filter(elemento => ids_opciones.includes(elemento.id))
        .map(elemento => elemento.valor);
    }
    return { tipo_preg, opciones_item }
  }

const getEncuesta = async(id_proyecto) => {

    const { proyecto } = await projectService.getOneProject(id_proyecto)

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
            
            transformedResult[sectionIndex].questions.push({
              questionId: item.id_pregunta,
              label: item.enunciado_pregunta,
              type: tipo_preg,
              options: opciones_item.map((opcion, i) => ({ option: opcion, value: opcion, id: i })),
              subQuestions: []
            });
          }
        } else {
          const id_padre = rel_subpreg.find(elemento => elemento.id_subpregunta === item.id_pregunta)?.id_pregunta_padre;
          if (id_padre !== undefined) {
            const { tipo_preg, opciones_item } = type_and_options(item, tipos_preguntas, opciones, opciones_x_preguntas);
            const subQuestion = {
              questionId: item.id_pregunta,
              label: item.enunciado_pregunta,
              type: tipo_preg,
              options: opciones_item.map((opcion, i) => ({ option: opcion, value: opcion, id: i }))
            };
      
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

const postEncuesta = async(id_proyecto, rawRespuestas) =>{

    const { proyecto } = await projectService.getOneProject(id_proyecto)

    /*
    respuestas = rawRespuestas.map(rta => {
          return {
            id_pregunta: rta.id_indicador,
            id_evaluador: id_evaluador,
            id_proyecto: id_proyecto,
            respuesta: rta.answer
          }
        })
        await knex('respuestas_encuesta').insert(respuestas)
        await knex('evaluadores_x_proyectos')
          .where({ id_proyecto: id_proyecto, id_evaluador: id_evaluador })
          .update({ fecha_fin_op: fecha_respuesta })

        return { response: 'respuestas guardadas' }
      } else {
        const _error = new Error('The user has already evaluated everything he should')
        _error.status = 409
        throw _error
      }
    }
    */
    return;
}

module.exports = {
    getEncuesta,
    postEncuesta
}