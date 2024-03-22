const knex = require('../database/knex.js')
const projectService = require('../services/projectService')
const insttitutionCYTService = require('../services/institutionCYTService.js')

const getRtas = async(arrayIdsEvaluadores, id_proyecto) => {
  const rtas = await knex('respuestas_evaluacion')
    .select('id_evaluador','id_indicador', 'respuesta', 'calificacion', 'justificacion')
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

// ----------------------------------------------------------------------------------------------------------

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

const getAmountQuestions = async(id_instancia) => {
  return (await knex('indicadores as i')
  .join('dimensiones as d', 'i.id_dimension', 'd.id')
    .where({id_instancia})
    .count().first())['count(*)']
}

const getInstancia = async(id_instancia, nombreInstancia, rol, respuestas = null, idsNoRespondieron = []) => {

  const dimensiones = {};
  const [indicadores, options] = await Promise.all([
    knex.select(
      'i.id as id_indicador',
      'i.pregunta',
      'i.fundamentacion',
      'i.descripcion',
      'i.determinante',
      'i.fecha_elim',
      'd.id as id_dimension',
      'd.nombre as nombre_dimension',
      'id_instancia'
    )
      .from('indicadores as i')
      .join('dimensiones as d', 'i.id_dimension', 'd.id')
      .where({id_instancia}),
    knex('opciones_evaluacion').select('id', 'opcion as option', 'peso as value').where({id_instancia})
  ])

  indicadores.forEach(row => {

    const newIndicador = {
      id_indicador: row.id_indicador,
      indicador: row.pregunta,
      descripcion: row.descripcion,
      determinante: row.determinante,
      fundamentacion: row.fundamentacion
    };

    if (respuestas && respuestas.length > 0) {
      newIndicador.respuestas = respuestas.filter(rta => {
        return rta.id_indicador === newIndicador.id_indicador;
      })

      newIndicador.respuestas.forEach(respuesta => {
        respuesta.option = respuesta.respuesta
        respuesta.value = respuesta.calificacion
        delete respuesta.respuesta
        delete respuesta.calificacion
        delete respuesta.id_indicador
      })
    }

    if(!dimensiones[row.nombre_dimension]) {
      dimensiones[row.nombre_dimension] = {
        id_dimension: row.id_dimension,
        indicadores: []
      }
    }

    dimensiones[row.nombre_dimension].indicadores.push(newIndicador)

  })


  if(rol == 'admin') {
    const respuestasVacias = idsNoRespondieron.map(id => ({
      id_evaluador: id,
      justificacion: null,
      option: null,
      value: null
    }));

    for (const clave in dimensiones) {
      if (Object.prototype.hasOwnProperty.call(dimensiones, clave)) {
        const indicadores = dimensiones[clave].indicadores;
        for (const ind of indicadores) {
          ind.respuestas = ind.respuestas ? [...ind.respuestas, ...respuestasVacias] : respuestasVacias;
        }
      }
    }
  }
  

  return { Instancia: 
    {
      nombre_instancia: nombreInstancia,
      dimensiones: dimensiones, 
      opciones: options
    } 
  }
}

const getInstanciaRtas = async(id_instancia, id_proyecto, arrayIdsEvaluadores) => {

  return await knex('respuestas_evaluacion as re')
    .join('indicadores as i', 're.id_indicador', 'i.id')
    .join('dimensiones as d', 'i.id_dimension', 'd.id')
    .select('id_evaluador','id_indicador', 'respuesta', 'calificacion', 'justificacion')
    .where({ id_proyecto })
    .whereIn('id_evaluador', arrayIdsEvaluadores)
    .where({id_instancia})

}

const postRtas = async(proyecto, id_usuario, id_instancia, raw_respuestas) => {

  if(raw_respuestas.length != await getAmountQuestions(id_instancia)) {
    const _error = new Error('The amount of answers does not match those expected')
    _error.status = 400
    throw _error
  }

  respuestas = raw_respuestas.map(rta => {
    return {
      id_indicador: rta.id_indicador,
      id_evaluador: id_usuario,
      id_proyecto: proyecto.id,
      respuesta: rta.answer,
      calificacion: rta.value,
      justificacion: rta.justificacion
    }
  })

  await knex.transaction(async (trx) => { 
    await trx('respuestas_evaluacion').insert(respuestas)

    if (id_instancia === 1) {
      await trx('evaluadores_x_proyectos')
        .where({ id_proyecto: proyecto.id, id_evaluador: id_usuario })
        .update({ respondio_entidad: 1 });
    } 

    // si las respuestas son del proposito o si el proyecto no tiene instancia de proposito
    if (id_instancia === 2 || !proyecto.obligatoriedad_proposito ) {
      
      await trx('evaluadores_x_proyectos')
        .where({ id_proyecto: proyecto.id, id_evaluador: id_usuario })
        .update({ fecha_fin_eval: getFecha() });

      const esDirector = proyecto.id_director === id_usuario;
      if (esDirector) {
        const participantes = proyecto.participantes.filter(participante => participante.rol !== 'director');
        const users = await trx('evaluadores').whereIn('id', participantes.map(participante => participante.id));
        // users.forEach(user => mailer.notifyReviewer(newProject.proyecto.titulo, user));

        await trx('proyectos').where({ id: proyecto.id }).update({ id_estado_eval: 3 });
      } else {
        const evaluadoresActivos = await trx('evaluadores_x_proyectos')
          .where({ id_proyecto: proyecto.id, fecha_fin_eval: null })
          .count('id');

        if (evaluadoresActivos === 0) {
          await trx('proyectos').where({ id: proyecto.id }).update({ id_estado_eval: 4 });
        }
      }
    }
  });
}

const getIDsNoRespondieron = async(id_proyecto, id_instancia) => {
  if (id_instancia == 1) {
    const idsNoRespondieron = await knex('evaluadores_x_proyectos')
      .select('id_evaluador')
      .where({ id_proyecto, respondio_entidad: 0})

    return idsNoRespondieron.map(objeto => objeto.id_evaluador)
  } else if(id_instancia == 2) {
    const idsNoRespondieron = await knex('evaluadores_x_proyectos')
      .select('id_evaluador')
      .where({ id_proyecto})
      .whereNull('fecha_fin_eval')

    return idsNoRespondieron.map(objeto => objeto.id_evaluador)
  }
  
}

const getIDsEvaluadores = async(id_proyecto) => {
  const participantes  = await projectService.getParticipants(id_proyecto)
  const arrayIds = []
  participantes.forEach( async(participante) => {
    arrayIds.push(participante.id)
  })
  return arrayIds
}

const getEntidad = async(id_proyecto, id_usuario, rol) => {
  await projectService.getOneProject(id_proyecto)
  const assigned = await verify_date(id_proyecto, id_usuario)
  const { id: id_instancia } = await knex('instancias').select('id').where({nombre: 'Entidad'}).first()

  if (rol === 'admin') { // es el admin, por lo que recibe las respuestas de todos los participantes
    const idsEvaluadores = await getIDsEvaluadores(id_proyecto)
    const idsNoRespondieron = await getIDsNoRespondieron(id_proyecto, id_instancia)
    return await getInstancia(id_instancia, 'Entidad', rol, await getInstanciaRtas(id_instancia, id_proyecto, idsEvaluadores), idsNoRespondieron)
  } else if(assigned.respondio_entidad) { // ya respondio las preguntas de la instancia de entidad
    return await getInstancia(id_instancia, 'Entidad', rol, await getInstanciaRtas(id_instancia, id_proyecto, [id_usuario]))
  } else {
    return await getInstancia(id_instancia, 'Entidad', rol)
  }

}
 
const getProposito = async(id_proyecto, id_usuario, rol) => {
  const { proyecto } = await projectService.getOneProject(id_proyecto)
  const assigned = await verify_date(id_proyecto, id_usuario)

  if(!proyecto.obligatoriedad_proposito){
    // el mensaje este no va a aparecer, pero lo pono igual
    const _error = new Error('The Proposito instance should not be evaluated in this project')
    _error.status = 204
    throw _error
  }

  const { id: id_instancia } = await knex('instancias').select('id').where({nombre: 'Proposito'}).first()
  if (rol === 'admin') { // es el admin, por lo que recibe las respuestas de todos los participantes
    const idsEvaluadores = await getIDsEvaluadores(id_proyecto)
    const idsNoRespondieron = await getIDsNoRespondieron(id_proyecto, id_instancia)
    return await getInstancia(id_instancia, 'Proposito', rol, await getInstanciaRtas(id_instancia, id_proyecto, idsEvaluadores), idsNoRespondieron)
  } else if(assigned.respondio_entidad) { // ya respondio las preguntas de la instancia de entidad
    return await getInstancia(id_instancia, 'Proposito', rol, await getInstanciaRtas(id_instancia, id_proyecto, [id_usuario]))
  } else {
    return await getInstancia(id_instancia, 'Proposito', rol)
  }

}

const postEntidad = async(id_proyecto, id_usuario, respuestas) => {
  const { proyecto } = await projectService.getOneProject(id_proyecto)
  const assigned = await verify_date(id_proyecto, id_usuario)

  if(assigned.respondio_entidad == 1){
    const _error = new Error("The user already answered the 'Entidad' instance questions")
    _error.status = 409
    throw _error
  } 

  await postRtas(proyecto, id_usuario, 1, respuestas)
}

const postProposito = async(id_proyecto, id_usuario, respuestas) => {
  const { proyecto } = await projectService.getOneProject(id_proyecto)
  const assigned = await verify_date(id_proyecto, id_usuario)

  if(!assigned.respondio_entidad) {
    const _error = new Error("The user should answer first the 'Entidad' instance questions")
    _error.status = 409
    throw _error
  }

  if(assigned.fecha_fin_eval !== null) {
    const _error = new Error("The user already answered the 'Proposito' instance questions")
    _error.status = 409
    throw _error
  } 

  await postRtas(proyecto, id_usuario, 2, respuestas)
}

module.exports = {
  getUserEvaluationAnswers,
  getEvaluationScores,

  getEntidad,
  getProposito,
  postEntidad,
  postProposito
}