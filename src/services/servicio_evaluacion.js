const gen_consulta = require('../database/gen_consulta')
const TABLA = ''

const preguntas = {
  tipo: 'evaluacion',
  id_evaluador: 1,
  id_proyecto: 2,
  entidad: [
    {
      id_dimension: 1,
      dimension: 'Avance cognitivo',
      indicadores: [
        {
          id_indicador: 1,
          indicador: 'esta es la pregunta 1?',
          fundamentacion: '',
          determinante: true
        },
        {
          id_indicador: 2,
          indicador: 'que dia es hoy?',
          fundamentacion: '',
          determinante: true
        }
      ]
    },
    {
      id_dimension: 2,
      dimension: 'Novedad local',
      indicadores: [
        {
          id_indicador: 3,
          indicador: 'esta es la pregunta de la dimension Novedad local?',
          fundamentacion: '',
          determinante: true
        }
      ]
    },
  ],
  proposito: [
    {
      id_dimension: 3,
      dimension: 'Calidad del desempeño',
      indicadores: [
        {
          id_indicador: 4,
          indicador: 'esta es la pregunta 1 del proposito?',
          fundamentacion: '',
          determinante: true
        }
      ]
    }
  ]
}

const getEvaluacion = async (id_proyecto, id_evaluador) => {
  /*
  preguntas.id_evaluador = id_evaluador
  preguntas.id_proyecto = parseInt(id_proyecto)
  return preguntas; */

  try {

    const tabla = 'evaluadores_x_proyectos'
    const condiciones = [
      `id_proyecto = ${id_proyecto}`,
      `id_evaluador = ${id_evaluador}`
    ]
    const existe = await gen_consulta._select(tabla, null, condiciones)

    if (existe.length === 1) { //existe un evaluador asignado a ese proyecto
      if (existe[0].fecha_fin_eval === null) { //el evaluador todavia no respondio la evaluacion del proyecto
        const preguntas = await get_eval_proyecto()
        return { tipo: 'evaluacion', preguntas }
      } else {
        if (existe[0].fecha_fin_op === null) { //el evaluador todavia no respondio la encuesta de opinion
          const preguntas = await get_opinion_proyecto()
          return { tipo: 'opinion', preguntas }
        }
        return 'no hay mas por evaluar capo'
      }
    }

  } catch (error) {
    throw (error)
  }
}

const tipo_and_opciones = (item, tipos_preguntas, opciones, opciones_x_preguntas) => {
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

const get_opinion_proyecto = async () => {
  const tipos_preguntas = await gen_consulta._select('tipo_preguntas', null, null)
  const opciones = await gen_consulta._select('opciones', null, null)
  const all_preguntas = await gen_consulta._call('obtener_Opinion')
  const opciones_x_preguntas = await gen_consulta._select('opciones_x_preguntas', null, null)
  const rel_subpreg = await gen_consulta._select('relacion_subpregunta', null, null)
  const transformedResult = {};

  all_preguntas[0].forEach(item => {

    if (item.id_seccion) {

      // Verificar si la sección ya existe en el objeto transformado
      if (!transformedResult[item.nombre_seccion.toLowerCase()]) {
        // Si no existe, crear un nuevo objeto de sección
        transformedResult[item.nombre_seccion.toLowerCase()] = {
          id_seccion: item.id_seccion,
          preguntas: []
        };
      }


      const { tipo_preg, opciones_item } = tipo_and_opciones(item, tipos_preguntas, opciones, opciones_x_preguntas)

      transformedResult[item.nombre_seccion.toLowerCase()].preguntas.push({
        id_pregunta: item.id_pregunta,
        enunciado_pregunta: item.enunciado_pregunta,
        tipo_pregunta: tipo_preg,
        opciones: opciones_item,
        subpreguntas: []
      });

    } else {
      const id_padre = rel_subpreg.filter(elemento => elemento.id_subpregunta === item.id_pregunta)[0].id_pregunta_padre
      const { tipo_preg, opciones_item } = tipo_and_opciones(item, tipos_preguntas, opciones, opciones_x_preguntas)

      const subpregunta = {
        id_pregunta: item.id_pregunta,
        enunciado_pregunta: item.enunciado_pregunta,
        tipo_pregunta: tipo_preg,
        opciones: opciones_item
      }

      for (const seccion in transformedResult) {
        const preguntas = transformedResult[seccion].preguntas;
        for (const pregunta of preguntas) {
          if (pregunta.id_pregunta === id_padre) {
            pregunta.subpreguntas.push(subpregunta);
          }
        }
      }
    }
  });
  return transformedResult
}

const get_eval_proyecto = async () => {
  const resultadosTransformados = {};
  const indicadores = await gen_consulta._call('obtener_Evaluacion')

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
  return resultadosTransformados
}

const postEvaluacion = async (id_proyecto, id_evaluador, respuestas) => {
  const flag_eval = true //esto vuela despues
  const fecha = new Date()
  const fecha_respuesta = [`${fecha.getFullYear()}-${fecha.getMonth() + 1}-${fecha.getDate()}`]

  if (flag_eval) {
    try {
      const atributos = '(id_indicador,id_evaluador,id_proyecto,respuesta,calificacion)'
      const tabla = `respuestas_evaluacion${atributos}`
      const resultados_a_insertar = respuestas.map(rta => [
        rta.id_indicador,
        id_evaluador,
        id_proyecto,
        rta.answer,
        rta.value
      ]);
      const res_insert_rtas = await gen_consulta._insert(tabla, resultados_a_insertar)

      const tabla2 = 'evaluadores_x_proyectos'
      const set = 'fecha_fin_eval = ?'
      const condiciones = [
        `id_proyecto = ${id_proyecto}`,
        `id_evaluador = ${id_evaluador}`]
      const res_put_fecha = await gen_consulta._update(tabla2, fecha_respuesta, set, condiciones)

      return res_insert_rtas
    } catch (error) {
      throw error
    }

  } else {
    // aca se entraria si fueran las repsuestas de la opinion
  }

}

module.exports = {
  getEvaluacion,
  postEvaluacion
}