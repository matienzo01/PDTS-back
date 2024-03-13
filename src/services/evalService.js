const res = require('express/lib/response.js')
const knex = require('../database/knex.js')
const projectService = require('../services/projectService')
const insttitutionCYTService = require('../services/institutionCYTService.js')

const verify_date = async (id_proyecto, id_evaluador) => {
  return await knex('evaluadores_x_proyectos').select()
    .where({ id_proyecto: id_proyecto, id_evaluador: id_evaluador })
}

const getNextEval = async (id_proyecto, id_evaluador) => {
  await projectService.getOneProject(id_proyecto)
  const existe = await verify_date(id_proyecto, id_evaluador)

  if (existe.length === 1) { //existe un evaluador asignado a ese proyecto
    if (existe[0].fecha_fin_eval === null) { //el evaluador todavia no respondio la evaluacion del proyecto
      const webform = await getProjectEval(id_proyecto)
      return { tipo: 'evaluacion', ...webform }
    } else {
      if (existe[0].fecha_fin_op === null && existe[0].obligatoriedad_opinion) { //el evaluador todavia no respondio la encuesta de opinion o no se debe responder
        const webform = await getProjectSurvey(existe[0].id_modelo_encuesta)
        return { tipo: 'opinion', ...webform }
      }
      const _error = new Error('There is nothing more to answer')
      _error.status = 409
      throw _error
    }
  }

  const _error = new Error('The user is not asigned to the project')
  _error.status = 403
  throw _error
}

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

const getProjectSurvey = async (id_modelo_encuesta) => {
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
    knex('modelos_x_secciones').select('id_seccion').where({ id_modelo: id_modelo_encuesta})
  ]);

  const transformedResult = [];

  all_preguntas.forEach(item => {
    if (item.id_seccion) {
      
      const pertenece = modelo.some(function(seccion) {
        return seccion.id_seccion === item.id_seccion
      })

      if (pertenece) { //verifico si la seccion pertenece al modelo
        let section = transformedResult.findIndex(section => section.sectionId === item.id_seccion)

        // Verificar si la sección ya existe en el objeto transformado
        if (section === -1) {
          // Si no existe, crear un nuevo objeto de sección
          section = transformedResult.push({ //devuelve la nueva longitud del array
            name: item.nombre_seccion.toLowerCase(),
            sectionId: item.id_seccion,
            questions: []
          }) - 1;
        }

        const { tipo_preg, opciones_item } = type_and_options(item, tipos_preguntas, opciones, opciones_x_preguntas)

        transformedResult[section].questions.push({
          questionId: item.id_pregunta,
          label: item.enunciado_pregunta,
          type: tipo_preg,
          options: opciones_item.map((opcion, i) => ({ option: opcion, value: opcion, id: i })), //va a ser necesario cambiar el id
          subQuestions: []
        });
      }

    } else {
      const id_padre = rel_subpreg.filter(elemento => elemento.id_subpregunta === item.id_pregunta)[0].id_pregunta_padre
      const { tipo_preg, opciones_item } = type_and_options(item, tipos_preguntas, opciones, opciones_x_preguntas)

      const subQuestion = {
        questionId: item.id_pregunta,
        label: item.enunciado_pregunta,
        type: tipo_preg,
        options: opciones_item.map((opcion, i) => ({ option: opcion, value: opcion, id: i }))
      }

      for (const section in transformedResult) {
        const questions = transformedResult[section].questions;
        for (const question of questions) {
          if (question.questionId === id_padre) {
            question.subQuestions.push(subQuestion);
          }
        }
      }
    }
  });
  return { name: 'Encuesta de opinion', sections: transformedResult }
}

const getProjectEval = async (id_proyecto, respuestas = null) => {
  const resultadosTransformados = {};
  const [indicadores, options, instancias, fecha_proyecto] = await Promise.all([
    knex.select(
      'i.id as id_indicador',
      'i.pregunta',
      'i.fundamentacion',
      'd.id as id_dimension',
      'd.nombre as nombre_dimension',
      'ins.id as id_instancia',
      'ins.nombre as nombre_instancia',
      'i.determinante',
      'i.fecha_elim'
    )
      .from('indicadores as i')
      .join('dimensiones as d', 'i.id_dimension', 'd.id')
      .join('instancias as ins', 'd.id_instancia', 'ins.id'),
    knex('opciones_evaluacion').select(),
    knex('instancias').select(),
    knex('proyectos').select('fecha_carga').where({ id: id_proyecto})
  ])

  const newOptions = {}
  const mapOptionsId = new Map();
  options.forEach(element => {
    mapOptionsId.set(element.opcion.toLowerCase(), element.id);

    const newOption = {
      id: element.id,
      option: element.opcion,
      value: element.peso
    }

    if (!newOptions[element.id_instancia]) {
      newOptions[element.id_instancia] = []
    }
    newOptions[element.id_instancia].push(newOption)
  })

  indicadores.forEach(row => {
    /*
    if ( row.fecha_elim && fecha_proyecto[0].fecha_carga <= row.fecha_elim)
      console.log(row.fecha_elim, fecha_proyecto[0].fecha_carga)*/

    const dimension = {
      id_dimension: row.id_dimension,
      nombre: row.nombre_dimension,
      indicadores: []
    };

    const indicador = {
      id_indicador: row.id_indicador,
      indicador: row.pregunta,
      fundamentacion: row.fundamentacion,
      determinante: row.determinante
    };
    
    if (respuestas) {
      indicador.respuestas = respuestas.filter(rta => {
        return rta.id_indicador === indicador.id_indicador;
      })

      indicador.respuestas.forEach(respuesta => {
        respuesta.option = respuesta.respuesta
        respuesta.value = respuesta.calificacion
        delete respuesta.respuesta
        delete respuesta.calificacion
        delete respuesta.id_indicador
      })

    }
    // Verificar si la dimensión ya existe en el objeto resultadosTransformados
    if (resultadosTransformados[row.nombre_instancia]) {
      // Verificar si la dimensión ya existe en la instancia
      const instancia = resultadosTransformados[row.nombre_instancia].find(
        inst => inst.id_dimension === row.id_dimension
      );

      if (instancia) {
        instancia.indicadores.push(indicador);
      } else {
        // Agregar la dimensión a la instancia existente
        resultadosTransformados[row.nombre_instancia].push({
          ...dimension,
          indicadores: [indicador]
        });
      }
    } else {
      // Agregar una nueva instancia con la dimensión y el indicador
      resultadosTransformados[row.nombre_instancia] = [{
        ...dimension,
        indicadores: [indicador]
      }];
    }
  });

  Object.keys(resultadosTransformados).forEach(instancia => {

    resultadosTransformados[instancia] = {
      dimensiones: resultadosTransformados[instancia],
      opciones_instancia: newOptions[instancias.find(item => item.nombre === instancia).id]
    };
  });

  return { name: 'Evaluación de proyecto', sections: resultadosTransformados }
}

const postEval = async (id_proyecto, id_evaluador, rawRespuestas) => {
  const { proyecto } = await projectService.getOneProject(id_proyecto)
  const evaluado = await verify_date(id_proyecto, id_evaluador)
  const fecha = new Date()
  const fecha_respuesta = [`${fecha.getFullYear()}-${fecha.getMonth() + 1}-${fecha.getDate()}`]

  let respuestas;

  if (evaluado.length === 1) {
    if (evaluado[0].fecha_fin_eval === null) {

      // aca habria que verificar que la fecha de eliminacion sea null o que sea posterior a la carga del proyecto
      const cant_preguntas = await knex('indicadores').count('* as count').whereNull('fecha_elim') //

      if (cant_preguntas[0].count === rawRespuestas.length) {
        respuestas = rawRespuestas.map(rta => {
          return {
            id_indicador: rta.id_indicador,
            id_evaluador: id_evaluador,
            id_proyecto: id_proyecto,
            respuesta: rta.answer,
            calificacion: rta.value
          }
        })
        await knex('respuestas_evaluacion').insert(respuestas)

        await knex('evaluadores_x_proyectos')
          .where({ id_proyecto: id_proyecto, id_evaluador: id_evaluador })
          .update({ fecha_fin_eval: fecha_respuesta })

        if (proyecto.id_director == id_evaluador) {
          proyecto.participantes.forEach( async(participante) => {
            if (participante.rol !== 'director'){
              const user = await knex('evaluadores').select().where({ id: participante.id }).first()
              //mailer.notifyReviewer(newProject.proyecto.titulo, user )
            }
          })
          await knex('proyectos')
            .where({ id: proyecto.id })
            .update({ id_estado_eval: 3 })
        } else {
          if ( (await knex('evaluadores_x_proyectos').select().where({ id_proyecto, fecha_fin_eval: null })).length === 0 ) {
            await knex('proyectos')
            .where({ id: proyecto.id })
            .update({ id_estado_eval: 4 })
          }
        }

        return { response: 'respuestas guardadas' }
      } else {
        const _error = new Error('The amount of answers does not match those expected')
        _error.status = 400
        throw _error
      }

    } else { // aca se entraria si fueran las repsuestas de la opinion
      if (evaluado[0].fecha_fin_op === null && proyecto.obligatoriedad_opinion) { //el evaluador todavia no respondio la encuesta de opinion+
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
  }

}

const getRtas = async(arrayIdsEvaluadores, id_proyecto) => {
  const rtas = await knex('respuestas_evaluacion')
    .select('id_evaluador','id_indicador', 'respuesta', 'calificacion')
    .where({ id_proyecto })
    .whereIn('id_evaluador', arrayIdsEvaluadores)

  if (rtas[0] !== undefined) {
    return { respuestas: await getProjectEval(id_proyecto, rtas) }
  }
  
  const _error = new Error('There are no answers for the project')
  _error.status = 404
  throw _error
}

const getUserEvaluationAnswers = async (id_proyecto, id_evaluador, rol) => {
  const participantes  = await projectService.getParticipants(id_proyecto)
  
  if (rol === 'admin'){
    const id  = await insttitutionCYTService.getInstIdFromAdmin(id_evaluador)
    await projectService.getOneProject(id_proyecto, id)
    
    const arrayIds = []
    participantes.forEach( async(participante) => {
      arrayIds.push(participante.id)
    })
    return await getRtas(arrayIds, id_proyecto)

  } else if (rol === 'evaluador') {
    await projectService.getOneProject(id_proyecto)
    if (participantes.some(participante => participante.id === id_evaluador)) {
      return await getRtas([id_evaluador], id_proyecto)
    }
    const _error = new Error('The user is not assigned to the project')
    _error.status = 403
    throw _error;
  }
    
}

const getEvaluationScores = async(id_proyecto) => {

  if (!await projectService.verifyState(id_proyecto, 'Evaluado')){
    const _error = new Error('The project has not yet finished evaluating. The answers are not yet available')
    _error.status = 404
    throw _error
  }
  
  const [ rtas, { cant_participantes } ] = await Promise.all([
    knex.select('id_indicador','id_dimension','id_instancia','id_evaluador','calificacion','respuesta','determinante','dimensiones.nombre as nombre_dimension')
      .from('respuestas_evaluacion')
      .join('indicadores', 'respuestas_evaluacion.id_indicador', 'indicadores.id')
      .join('dimensiones', 'indicadores.id_dimension', 'dimensiones.id')
      .where({id_proyecto}),
    knex('evaluadores_x_proyectos')
      .count('* as cant_participantes')
      .where('id_proyecto', id_proyecto).first()
  ])

  const entidad = {}  
  const proposito = {}
  let totDeterminantes = 8
  let totNoDeterminantes = 4
  let totProposito = 48

  rtas.forEach( rta => {
    const { id_instancia, nombre_dimension, determinante, calificacion } = rta;
    const factor = calificacion / cant_participantes;
  
    if (id_instancia === 1) {
      entidad[nombre_dimension] = entidad[nombre_dimension] || { determinantes: 0, noDeterminantes: 0 };
      determinante ? entidad[nombre_dimension].determinantes += factor : entidad[nombre_dimension].noDeterminantes += factor;
    } else {
      proposito[nombre_dimension] = proposito[nombre_dimension] || { score: 0 };
      proposito[nombre_dimension].score += factor;
    }
  })
  return { entidad: entidad, proposito: proposito, totD: totDeterminantes, totND: totNoDeterminantes, totP: totProposito }
}

module.exports = {
  getNextEval,
  postEval,
  getUserEvaluationAnswers,
  getProjectSurvey,
  getEvaluationScores
}