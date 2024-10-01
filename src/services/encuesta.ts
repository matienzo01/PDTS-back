import knex from '../database/knex';
import project from '../services/project';
import projectService from '../services/project';
import institutionCYT from './institutionCYT';
import { CustomError } from '../types/CustomError';
import { Participante } from '../types/Participante';
import { Proyecto } from '../types/Proyecto';
import { RespuestaEncuesta } from '../types/RespuestaEncuesta';

const type_and_options = (
  item: any,
  tipos_preguntas: { id: number; tipo: string }[],
  opciones: { id: number; valor: string }[],
  opciones_x_preguntas: { id_opcion: number; id_preguntas_seccion: number }[]) => {
  const tipo_preg = tipos_preguntas[item.id_tipo_pregunta - 1].tipo
  let opciones_item: { id: number; valor: string }[] = []
  if (tipo_preg === 'opcion multiple') {
    const ids_opciones = opciones_x_preguntas
      .filter(elemento => elemento.id_preguntas_seccion === item.id_pregunta)
      .map(elemento => elemento.id_opcion)

    opciones_item = opciones
      .filter(item => ids_opciones.includes(item.id))
  }
  return { tipo_preg, opciones_item }
}

const getFecha = () => {
  const fecha = new Date()
  return `${fecha.getFullYear()}-${fecha.getMonth() + 1}-${fecha.getDate()}`
}

const getIdsPreguntasModelo = async (id_modelo: number) => {

  if (!await knex('modelos_encuesta').select().where({ id: id_modelo })) {
    throw new CustomError('El id del modelo no corresponde con ningun modelo de encuesta existente', 404)
  }

  const ids = (await knex('preguntas_seccion as ps')
    .join('modelos_x_secciones as ms', 'ms.id_seccion', 'ps.id_seccion')
    .where('ms.id_modelo', id_modelo)
    .select('ps.id', 'ps.pregunta', 'ps.id_seccion', 'ps.id_tipo_pregunta')
    .union(function () {
      this.select('ps.id', 'ps.pregunta', 'ps.id_seccion', 'ps.id_tipo_pregunta')
        .from('preguntas_seccion as ps')
        .join('relacion_subpregunta as rs', 'rs.id_subpregunta', 'ps.id')
        .whereIn('rs.id_pregunta_padre', knex('preguntas_seccion as ps')
          .join('modelos_x_secciones as ms', 'ms.id_seccion', 'ps.id_seccion')
          .where('ms.id_modelo', id_modelo)
          .select('ps.id')
        );
    })).map(p => p.id)

  return ids
}

const generateEncuesta = async (proyecto: any, rol: string, respuestas: any[] | null = null, idsNoRespondieron: number[] | null = null) => {
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
      .whereIn('preguntas_seccion.id', await getIdsPreguntasModelo(proyecto.id_modelo_encuesta))
      .leftJoin('secciones', 'preguntas_seccion.id_seccion', 'secciones.id'),
    knex('opciones_x_preguntas').select(),
    knex('relacion_subpregunta').select(),
    knex('modelos_x_secciones').select('id_seccion').where({ id_modelo: proyecto.id_modelo_encuesta })
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

        if (respuestas?.length) {
          const rtasFiltradas = respuestas
            .filter(rta => { return rta.id_pregunta === question.questionId; })
            .map(({ id_evaluador, respuesta, optionId, id_proyecto }) => ({ id_evaluador, respuesta, optionId, id_proyecto }));

          if (rtasFiltradas.length) {
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

        if (respuestas?.length) {
          const rtasFiltradas = respuestas
            .filter(rta => { return rta.id_pregunta === subQuestion.questionId; })
            .map(({ id_evaluador, respuesta, optionId, id_proyecto }) => ({ id_evaluador, respuesta, optionId, id_proyecto }));
          if (rtasFiltradas.length) {
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


  if ((rol == 'admin general' || rol == 'admin') && idsNoRespondieron) {
    const respuestasVacias: RespuestaEncuesta[] = idsNoRespondieron.map(id => ({
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

const getEncuestaRtas = async (id_proyecto: number[], arrayIdsEvaluadores: number[], rol: string) => {

  let query = knex('respuestas_encuesta as re')
    .join('preguntas_seccion as p', 're.id_pregunta', 'p.id')
    .leftJoin('opciones as o', 're.respuesta', 'o.valor')
    .select('re.id_evaluador', 'id_pregunta', 'respuesta', 'o.id as optionId')
    .whereIn('re.id_proyecto', id_proyecto)
    .whereIn('re.id_evaluador', arrayIdsEvaluadores)

  if (rol == 'admin general' || rol == 'admin') {
    query = query
      .join('evaluadores_x_proyectos as ep', 're.id_proyecto', 'ep.id_proyecto')
      .whereNotNull('ep.fecha_fin_op');
  }

  return await query
}

const getIDsNoRespondieron = async (id_proyecto: number) => {
  const idsNoRespondieron = await knex('evaluadores_x_proyectos')
    .select('id_evaluador')
    .where({ id_proyecto })
    .whereNull('fecha_fin_op')

  return idsNoRespondieron.map(objeto => objeto.id_evaluador)

}

const getIDsEvaluadores = async (id_proyecto: number) => {
  const participantes: Participante[] = await projectService.getParticipants(id_proyecto)
  const arrayIds: number[] = []
  participantes.forEach(async (participante) => {
    arrayIds.push(participante.id)
  })
  return arrayIds
}

const getEncuesta = async (id_proyecto: number, id_usuario: number, rol: string) => {
  const { proyecto } = await projectService.getOneProject(id_proyecto)

  if (!proyecto.obligatoriedad_opinion) {
    throw new CustomError('La encuesta del sistema no es aplcable a este proyecto', 409)
  }

  if (rol != 'evaluador') {
    if (rol == 'admin' && proyecto.id_institucion != await institutionCYT.getInstIdFromAdmin(id_usuario)) {
      throw new CustomError('La encuesta solicitada pertenece a una institucion diferente a la que el administrador corresponde', 409)
    }
    const idsEvaluadores: number[] = await getIDsEvaluadores(id_proyecto)
    const idsNoRespondieron: number[] = await getIDsNoRespondieron(id_proyecto)
    return await generateEncuesta(proyecto, rol, await getEncuestaRtas([id_proyecto], idsEvaluadores, rol), idsNoRespondieron)
  } else {
    await projectService.verify_date(id_proyecto, id_usuario)
    return await generateEncuesta(proyecto, rol, await getEncuestaRtas([id_proyecto], [id_usuario], rol))
  }

}

const canAnswer = async (id_proyecto: number, id_evaluador: number) => {
  const { proyecto } = await projectService.getOneProject(id_proyecto)

  if (!proyecto.obligatoriedad_opinion) {
    throw new CustomError('La encuesta del sistema no es aplcable a este proyecto', 409)
  }

  const assigned = await projectService.verify_date(id_proyecto, id_evaluador)

  if (assigned.fecha_fin_eval == null) {
    throw new CustomError('Debes completar la evaluacion del proyecto primero', 409)
  }

  if (assigned.fecha_fin_op != null) {
    throw new CustomError('Ya completaste la encuesta del sistema', 409)
  }

  return proyecto
}

const postEncuesta = async (id_proyecto: number, id_evaluador: number, rawRespuestas: { id_indicador: number; answer: string }[]) => {
  await canAnswer(id_proyecto, id_evaluador)

  await knex.transaction(async (trx) => {

    const opciones = await trx('opciones').select('valor')
    const valores = opciones.map(objeto => objeto.valor).concat(undefined)
    valores.push('si', 'no')

    const rawIdsOpciones = await trx('preguntas_seccion').select('id').whereIn('id_tipo_pregunta', [1, 3])
    const idsOpciones = rawIdsOpciones.map(objeto => objeto.id)

    const respuestas = rawRespuestas.map(rta => {

      if (rta.answer === undefined) {
        return null
      }

      if (idsOpciones.includes(rta.id_indicador)) {
        if (!valores.includes(rta.answer)) {
          throw new CustomError(`La respuesta '${rta.answer}' no es una opcion valida para el indicador "${rta.id_indicador}"`, 400)
        }
      }

      return {
        id_pregunta: rta.id_indicador,
        id_evaluador: id_evaluador,
        id_proyecto: id_proyecto,
        respuesta: rta.answer
      }
    }).filter((rta): rta is { id_pregunta: number, id_evaluador: number, id_proyecto: number, respuesta: string } => rta !== null);

    respuestas.forEach(async (rta) => {
      try {
        await knex('respuestas_encuesta').insert(rta);
      } catch (error) {
        if ((error as any).code === 'ER_DUP_ENTRY') {
          await knex('respuestas_encuesta')
            .where({ id_pregunta: rta.id_pregunta })
            .where({ id_evaluador: rta.id_evaluador })
            .where({ id_proyecto: rta.id_proyecto })
            .update(rta);
        } else {
          throw error
        }
      }
    })

  })

}

const finallizarEncuesta = async (id_proyecto: number, id_usuario: number) => {
  const { id_modelo_encuesta } = await canAnswer(id_proyecto, id_usuario)

  await getIdsPreguntasModelo(id_modelo_encuesta)

  const [rawPreguntas, respuestas, relacion] = await Promise.all([
    (await knex('preguntas_seccion as ps')
      .select('ps.id', 'ps.pregunta', 'ps.id_seccion', 'ps.id_tipo_pregunta')
      .whereIn('ps.id', await getIdsPreguntasModelo(id_modelo_encuesta))).filter(p => p.id_tipo_pregunta != 4),
    knex('respuestas_encuesta')
      .where({ id_evaluador: id_usuario })
      .where({ id_proyecto })
      .whereNotNull('respuesta'),
    knex('relacion_subpregunta')
  ])

  if (respuestas == undefined || rawPreguntas == undefined) {
    throw new CustomError('Internal server Error', 500)
  }

  if (respuestas.length == 0) {
    throw new CustomError('El numero de respuestas no coincide con el esperado', 400)
  }

  const subpreguntasTipo2 = rawPreguntas.filter(pregunta => pregunta.id_tipo_pregunta === 2);
  const preguntasPadreTipo3 = rawPreguntas.filter(pregunta => pregunta.id_tipo_pregunta === 3);
  const preguntasRelacionadas: { id_padre: number, id_subpregunta: number }[] = [];

  subpreguntasTipo2.forEach(subpregunta => {
    const relacionPadre = relacion.find(rel => rel.id_subpregunta === subpregunta.id);
    if (relacionPadre) {
      const preguntaPadre = preguntasPadreTipo3.find(padre => padre.id === relacionPadre.id_pregunta_padre);
      if (preguntaPadre) {
        preguntasRelacionadas.push({
          id_padre: preguntaPadre.id,
          id_subpregunta: subpregunta.id
        });
      }
    }
  });

  let contador = 0
  preguntasRelacionadas.forEach(r => {
    const rtaPadre = respuestas.find(rta => rta.id_pregunta == r.id_padre)
    const rtaHija = respuestas.find(rta => rta.id_pregunta == r.id_subpregunta)

    if (rtaPadre == undefined) {
      const question = {
        id: r.id_padre,
        pregunta: rawPreguntas.find(p => p.id == r.id_padre).pregunta
      }
      throw new CustomError('El numero de respuestas no coincide con el esperado', 400, [question])
    }

    if (rtaPadre.respuesta == 'si' && rtaHija == undefined) {
      const question = {
        id: r.id_subpregunta,
        pregunta: rawPreguntas.find(p => p.id == r.id_subpregunta).pregunta
      }
      throw new CustomError('El numero de respuestas no coincide con el esperado', 400, [question])
    }

    if (rtaPadre.respuesta == 'no' && rtaHija == undefined) {
      contador++
    }

  })

  if (respuestas.length + contador !== rawPreguntas.length) {
    throw new CustomError('El numero de respuestas no coincide con el esperado', 400)
  }

  await knex('evaluadores_x_proyectos')
    .where({ id_proyecto: id_proyecto, id_evaluador: id_usuario })
    .update({ fecha_fin_op: getFecha() })

  return await getEncuesta(id_proyecto, id_usuario, 'evaluador')
}

const calculaPorcentaje = (question: any, totalRespuestas: number) => {
  if (question.type === 'opcion multiple') {
    calcularPorcentajesOpcionMultiple(question, totalRespuestas);
  } else if (question.type === 'si/no') {
    const percentageSiNo = totalRespuestas > 0 ? calcularPorcentajeSiNo(question.respuestas, totalRespuestas) : 0;
    const percentageNo = totalRespuestas > 0 ? (100 - percentageSiNo) : 0;

    question.options.push({
      "valor": "si",
      "percentage": percentageSiNo.toFixed(2)
    });
    question.options.push({
      "valor": "no",
      "percentage": percentageNo.toFixed(2)
    });
  }
}

function calcularPorcentajeSiNo(respuestas: any, totalRespuestas: number) {
  const countSi = respuestas.filter((respuesta: any) => respuesta.respuesta === 'si').length;
  return (countSi / totalRespuestas) * 100;
}

const calcularPorcentajesOpcionMultiple = (question: any, totalRespuestas: number) => {

  const porcentajes: { optionId: number, percentage: number, valor: string }[] = []
  question.options.forEach((o: any) => {
    porcentajes.push({
      optionId: o.id,
      percentage: 0,
      valor: o.valor
    })
  })

  if (totalRespuestas > 0) {
    question.respuestas.forEach((rta: any) => {
      const a = porcentajes.find((p: any) => p.optionId == rta.optionId)
      if (a != undefined) {
        a.percentage += (100 / totalRespuestas)
      }
    })
  }

  question.options = porcentajes.map(p => ({
    ...p,
    percentage: p.percentage.toFixed(2)
  }));

}

const obtenerRespuestasEncuesta = async (filter: any) => {
  const query = knex('respuestas_encuesta')
    .leftJoin('opciones as o', 'respuestas_encuesta.respuesta', 'o.valor')
    .join('evaluadores_x_proyectos', function () {
      this.on('respuestas_encuesta.id_proyecto', '=', 'evaluadores_x_proyectos.id_proyecto')
        .andOn('respuestas_encuesta.id_evaluador', '=', 'evaluadores_x_proyectos.id_evaluador');
    })
    .whereNotNull('evaluadores_x_proyectos.fecha_fin_op');

  for (const key in filter) {
    if (Array.isArray(filter[key])) {
      query.whereIn(key, filter[key]);
    } else {
      query.andWhere(key, filter[key]);
    }
  }

  return await query.select('respuestas_encuesta.*', 'o.id as optionId');
};

const obtenerCantidad = async (filter: any): Promise<number> => {
  const query = knex('evaluadores_x_proyectos')
    .whereNotNull('fecha_fin_op');

  for (const key in filter) {
    if (Array.isArray(filter[key])) {
      query.whereIn(key, filter[key]);
    } else {
      query.andWhere(key, filter[key]);
    }
  }

  return (await query).length
};

const getPromediosGlobal = async (): Promise<any> => {
  const modelos = await knex('modelos_encuesta').select('id', 'nombre').where('editable', 0)
  const proyectos = await knex('proyectos').select('id', 'id_modelo_encuesta')

  const promediosGlobal = []
  for (const modelo of modelos) {
    const ids = proyectos.filter(p => p.id_modelo_encuesta == modelo.id).map(p => p.id)
    console.log(ids)
    const responses = await obtenerRespuestasEncuesta({ 'evaluadores_x_proyectos.id_proyecto': ids });
    const cantidad = await obtenerCantidad({ 'evaluadores_x_proyectos.id_proyecto': ids });
    promediosGlobal.push({
      modelo: modelo.nombre,
      modeloId: modelo.id,
      cantidadEncuestas: cantidad,
      sections: await getEncuestaPromedios(modelo.id, responses, cantidad)
    })
  }

  return { promediosGlobal: promediosGlobal }
};

const getPromediosInstitucion = async (id_institucion: number): Promise<any> => {
  const { proyectos } = await project.getAllInstitutionProjects(id_institucion);
  const modelos = await knex('modelos_encuesta').select('id', 'nombre').where('editable', 0)
  const promediosModelos = []
  for (const modelo of modelos) {
    console.log(modelo)
    const ids = proyectos
      .filter(proyecto => proyecto.obligatoriedad_opinion == 1)
      .filter(proyecto => proyecto.id_modelo_encuesta == modelo.id)
      .map(proyecto => proyecto.id);

    const responses = await obtenerRespuestasEncuesta({ 'evaluadores_x_proyectos.id_proyecto': ids });
    const cantidad = await obtenerCantidad({ 'evaluadores_x_proyectos.id_proyecto': ids });

    promediosModelos.push({
      name: modelo.nombre,
      modeloId: modelo.id,
      cantidadEncuestas: cantidad,
      sections: await getEncuestaPromedios(modelo.id, responses, cantidad)
    })
  }

  return { promediosInstitucion: promediosModelos }
};

const getPromediosProyecto = async (id_institucion: number, id_proyecto: number): Promise<any> => {
  const { proyecto } = await project.getOneProject(id_proyecto, id_institucion);
  if (!proyecto.obligatoriedad_opinion) {
    throw new CustomError('La encuesta del sistema no es aplcable a este proyecto', 409)
  }

  const responses = await obtenerRespuestasEncuesta({ 'evaluadores_x_proyectos.id_proyecto': id_proyecto });
  const cantidad = await obtenerCantidad({ id_proyecto });

  return {
    PromediosProyecto: {
      proyecto: proyecto.titulo,
      cantidadEncuestas: cantidad,
      sections: await getEncuestaPromedios(proyecto.id_modelo_encuesta, responses, cantidad)
    }
  }
};

const getEncuestaPromedios = async (idModelo: number, responses: any, cantidad: number) => {
  const encuesta: any = await generateEncuesta({ id_modelo_encuesta: idModelo }, 'admin_general', responses)
  encuesta.cantidadEncuestas = cantidad
  encuesta.sections.forEach((section: any) => {
    section.questions.forEach((question: any) => {
      calculaPorcentaje(question, cantidad)
      question.subQuestions.forEach((subq: any) => {
        calculaPorcentaje(subq, cantidad)
      })
    })
  })
  return encuesta.sections
}

export default {
  getEncuesta,
  postEncuesta,
  finallizarEncuesta,
  getPromediosGlobal,
  getPromediosInstitucion,
  getPromediosProyecto
}