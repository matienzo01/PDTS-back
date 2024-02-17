const gen_consulta = require('../database/gen_consulta')
const knex = require('../database/knex.js')
const service_projects = require('../services/projectService')

const verify_date = async (id_proyecto, id_evaluador) => {
  return await knex('evaluadores_x_proyectos').select()
    .where({ id_proyecto: id_proyecto, id_evaluador: id_evaluador })
}

const check_project = async (id_proyecto) => {
  return await service_projects.getOneProject(id_proyecto)
}


const getNextEval = async (id_proyecto, id_evaluador) => {

  await check_project(id_proyecto)
  const existe = await verify_date(id_proyecto, id_evaluador)

  if (existe.length === 1) { //existe un evaluador asignado a ese proyecto
    if (existe[0].fecha_fin_eval === null) { //el evaluador todavia no respondio la evaluacion del proyecto
      const webform = await getProjectEval()
      return { tipo: 'evaluacion', ...webform }
    } else {
      if (existe[0].fecha_fin_op === null) { //el evaluador todavia no respondio la encuesta de opinion
        const webform = await getProjectSurvey()
        return { tipo: 'opinion', ...webform }
      }
      return 'no hay mas por evaluar capo'
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

const getProjectSurvey = async () => {
  const [tipos_preguntas, opciones, all_preguntas, opciones_x_preguntas, rel_subpreg] = await Promise.all([
    knex('tipo_preguntas').select(),
    knex('opciones').select(),
    gen_consulta._call('obtener_Opinion'),
    knex('opciones_x_preguntas').select(),
    knex('relacion_subpregunta').select()
  ]);

  const transformedResult = [];

  all_preguntas[0].forEach(item => {
    if (item.id_seccion) {
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

const getProjectEval = async () => {
  const resultadosTransformados = {};
  const [indicadores, options, instancias] = await Promise.all([
    gen_consulta._call('obtener_Evaluacion'),
    knex('opciones_evaluacion').select(),
    knex('instancias').select()
  ])

  const newOptions = {}
  options.forEach(element => {
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

  indicadores[0].forEach(row => {

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


const postEval = async (id_proyecto, id_evaluador, respuestas) => {
  const evaluado = await verify_date(id_proyecto, id_evaluador)
  const fecha = new Date()
  const fecha_respuesta = [`${fecha.getFullYear()}-${fecha.getMonth() + 1}-${fecha.getDate()}`]

  respuestas.forEach(rta => {
    rta.id_evaluador = id_evaluador
    rta.id_proyecto = id_proyecto
    rta.respuesta = rta.answer
    if (rta.value !== undefined)
      rta.calificacion = rta.value

    delete rta.value
    delete rta.answer
  })

  if (evaluado.length === 1) {
    if (evaluado[0].fecha_fin_eval === null) {
      try {
        //aca habria que verificar que se intenten insertar un numero de respuestas iguales al total de preguntas 
        //de la evaluacion

        await knex('respuestas_evaluacion').insert(respuestas)


        // actualizo la tabla evaluadores_x_proyectos con la fecha de finalizacion de la evaluacion 
        // para asi posteriormente verificar si el proyecto ya fue evaluado
        await knex('evaluadores_x_proyectos')
          .where({ id_proyecto: id_proyecto, id_evaluador: id_evaluador })
          .update({ fecha_fin_eval: fecha_respuesta })

        return { response: 'respuestas guardadas' }
      } catch (error) {
        throw error
      }
    } else { // aca se entraria si fueran las repsuestas de la opinion
      if (evaluado[0].fecha_fin_op === null) { //el evaluador todavia no respondio la encuesta de opinion


        //hay que hacer esta logica


      } else {
        return 'no hay mas por evaluar capo'
      }
    }
  }

}

module.exports = {
  getNextEval,
  postEval
}