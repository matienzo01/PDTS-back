import knex from '../database/knex'
import projectService from './project'
import insttitutionCYTService from './institutionCYT'
import { CustomError } from '../types/CustomError'
import { Indicador } from '../types/Indicador'
import { Dimension } from '../types/Dimension'
import { RespuestaEval } from '../types/RespuestaEval'
import { Proyecto } from '../types/Proyecto'
import { Participante } from '../types/Participante'

const getEvaluationScores = async(id_proyecto: number) => {

  if (!await projectService.verifyState(id_proyecto, 'Evaluado')){
    throw new CustomError('The project has not yet finished evaluating. The answers are not yet available', 409)
  }
  
  const rtas = await knex.select('id_indicador','id_dimension','id_instancia','id_evaluador','calificacion','respuesta','determinante','dimensiones.nombre as nombre_dimension')
    .from('respuestas_evaluacion')
    .join('indicadores', 'respuestas_evaluacion.id_indicador', 'indicadores.id')
    .join('dimensiones', 'indicadores.id_dimension', 'dimensiones.id')
    .where({id_proyecto})

  const participantes = (await knex('evaluadores_x_proyectos')
  .count('* as cantidad')
  .where('id_proyecto', id_proyecto).first())

  const entidad: any = {}  
  const proposito: any = {}
  let totDeterminantes = 8
  let totNoDeterminantes = 4
  let totProposito = 48

  rtas.forEach( rta => {
    const { id_instancia, nombre_dimension, determinante, calificacion } = rta;
    let factor = 0

    if(participantes != undefined){
      factor = calificacion / (participantes.cantidad as number);
    }
    
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

const verify_date = async (id_proyecto: number, id_evaluador: number ) => {
  const assigned = await knex('evaluadores_x_proyectos').select()
    .where({ id_proyecto: id_proyecto, id_evaluador: id_evaluador })
    .first()
  
  if(!assigned) {
    throw new CustomError('The user is not linked to the project', 403)
  }

  return assigned
}

const getFecha = () => {
  const fecha = new Date()
  return `${fecha.getFullYear()}-${fecha.getMonth() + 1}-${fecha.getDate()}`
}

const getAmountQuestions = async(id_instancia: number) => {
  let amount: any =  (await knex('indicadores as i')
  .join('dimensiones as d', 'i.id_dimension', 'd.id')
    .where({id_instancia})
    .count().first())
  if(amount == undefined){
    throw new CustomError('There is no instancia with the provided id', 404)
  }
  
  return amount['count(*)']
}

const getInstancia = async(id_instancia: number, nombreInstancia: string, rol: string, respuestas: RespuestaEval[] | null = null, idsNoRespondieron: number[] = []) => {

  const dimensiones: { [nombre: string]: Dimension } = {};
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

    let newIndicador: Partial<Indicador> = {
      id_indicador: row.id_indicador,
      pregunta: row.pregunta,
      descripcion: row.descripcion,
      determinante: row.determinante,
      fundamentacion: row.fundamentacion
    };

    if (respuestas && respuestas.length > 0) {
      newIndicador.respuestas = respuestas.filter(rta => rta.id_indicador === newIndicador.id_indicador);
      newIndicador.respuestas.forEach(respuesta => delete respuesta.id_indicador);
  }

    if(!dimensiones[row.nombre_dimension]) {
      dimensiones[row.nombre_dimension] = {
        id_dimension: row.id_dimension,
        indicadores: []
      }
    }
    
    if (dimensiones[row.nombre_dimension]?.indicadores) {
      // @ts-ignore
      dimensiones[row.nombre_dimension].indicadores.push(newIndicador);
    }

  })


  if(rol == 'admin') {
    const respuestasVacias: RespuestaEval[]  = idsNoRespondieron.map(id => ({
      id_evaluador: id,
      justificacion: null,
      option: null,
      value: null
    }));

    for (const clave in dimensiones) {
      if (Object.prototype.hasOwnProperty.call(dimensiones, clave)) {
        const indicadores = dimensiones[clave].indicadores ?? [];
        for (const ind of indicadores) {
          ind.respuestas = ind.respuestas 
            ? [...ind.respuestas, ...respuestasVacias] 
            : respuestasVacias;
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

const getInstanciaRtas = async(id_instancia: number, id_proyecto: number, arrayIdsEvaluadores: number[]) => {

  return await knex('respuestas_evaluacion as re')
    .join('indicadores as i', 're.id_indicador', 'i.id')
    .join('dimensiones as d', 'i.id_dimension', 'd.id')
    .select('id_evaluador','id_indicador', 'respuesta as option', 'calificacion as value', 'justificacion')
    .where({ id_proyecto })
    .whereIn('id_evaluador', arrayIdsEvaluadores)
    .where({id_instancia})

}

const postRtas = async(proyecto: Proyecto, id_usuario: number, id_instancia: number, raw_respuestas: any[]) => {

  if(raw_respuestas.length != await getAmountQuestions(id_instancia)) {
    throw new CustomError('The amount of answers does not match those expected', 400)
  }

  let respuestas = raw_respuestas.map((rta: any)=> {
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

      
      if (proyecto.id_director === id_usuario) { // es director
        const participantes = proyecto.participantes.filter(participante => participante.rol !== 'director');
        const users = await trx('evaluadores').whereIn('id', participantes.map(participante => participante.id));
        // users.forEach(user => mailer.notifyReviewer(newProject.proyecto.titulo, user));

        await trx('proyectos').where({ id: proyecto.id }).update({ id_estado_eval: 3 });
      } 
    }
  });
}

const getIDsNoRespondieron = async(id_proyecto: number, id_instancia: number) => {
  if (id_instancia == 1) {
    const idsNoRespondieron = await knex('evaluadores_x_proyectos')
      .select('id_evaluador')
      .where({ id_proyecto, respondio_entidad: 0})

    const arrayIds: number[] = idsNoRespondieron.map(objeto => objeto.id_evaluador)
    return arrayIds
  } else if(id_instancia == 2) {
    const idsNoRespondieron = await knex('evaluadores_x_proyectos')
      .select('id_evaluador')
      .where({ id_proyecto})
      .whereNull('fecha_fin_eval')

    const arrayIds: number[] = idsNoRespondieron.map(objeto => objeto.id_evaluador)
    return arrayIds
  }
  
}

const getIDsEvaluadores = async(id_proyecto: number) => {
  const participantes  = await projectService.getParticipants(id_proyecto)
  const arrayIds: number[] = []
  participantes.forEach( async(participante: Participante) => {
    arrayIds.push(participante.id)
  })
  return arrayIds
}

const getEntidad = async(id_proyecto: number, id_usuario: number, rol: string) => {
  const { id: id_instancia } = await knex('instancias').select('id').where({nombre: 'Entidad'}).first()

  if (rol === 'admin') { // es el admin, por lo que recibe las respuestas de todos los participantes
    await verifyProject(id_proyecto, true, id_usuario)

    const idsEvaluadores = await getIDsEvaluadores(id_proyecto)
    const idsNoRespondieron: number[] = (await getIDsNoRespondieron(id_proyecto, id_instancia) as number[])
    return await getInstancia(id_instancia, 'Entidad', rol, await getInstanciaRtas(id_instancia, id_proyecto, idsEvaluadores), idsNoRespondieron)
  } else {
    await verifyProject(id_proyecto, true)
    const assigned = await verify_date(id_proyecto, id_usuario)

    if(assigned.respondio_entidad) { // ya respondio las preguntas de la instancia de entidad
      return await getInstancia(id_instancia, 'Entidad', rol, await getInstanciaRtas(id_instancia, id_proyecto, [id_usuario]))
    } else {
      return await getInstancia(id_instancia, 'Entidad', rol)
    }
  }

}

const verifyProject = async(id_proyecto: number, entidad: boolean, id_usuario: number | null = null) => {
  let proyecto
  if(id_usuario != null) {
    const id  = await insttitutionCYTService.getInstIdFromAdmin(id_usuario)
    proyecto = (await projectService.getOneProject(id_proyecto, id)).proyecto
  } else {
    proyecto = (await projectService.getOneProject(id_proyecto)).proyecto
  }

  if(!entidad && !proyecto.obligatoriedad_proposito){
    throw new CustomError('The proposito instance should not be evaluated in this project', 204)
  }
}

const getProposito = async(id_proyecto: number, id_usuario: number, rol: string) => {
  
  const { id: id_instancia } = await knex('instancias').select('id').where({nombre: 'Proposito'}).first()

  if (rol === 'admin') { // es el admin, por lo que recibe las respuestas de todos los participantes
    await verifyProject(id_proyecto, false, id_usuario)
    const idsEvaluadores = await getIDsEvaluadores(id_proyecto)
    const idsNoRespondieron = await getIDsNoRespondieron(id_proyecto, id_instancia)
    return await getInstancia(id_instancia, 'Proposito', rol, await getInstanciaRtas(id_instancia, id_proyecto, idsEvaluadores), idsNoRespondieron)
  } else {
    await verifyProject(id_proyecto, false)
    const assigned = await verify_date(id_proyecto, id_usuario)

    if(assigned.respondio_entidad) { // ya respondio las preguntas de la instancia de entidad
      return await getInstancia(id_instancia, 'Proposito', rol, await getInstanciaRtas(id_instancia, id_proyecto, [id_usuario]))
    } else {
      return await getInstancia(id_instancia, 'Proposito', rol)
    }

  }

}

const postEntidad = async(id_proyecto: number, id_usuario: number, respuestas: any) => {
  const { proyecto } = await projectService.getOneProject(id_proyecto)
  const assigned = await verify_date(id_proyecto, id_usuario)

  if(assigned.respondio_entidad == 1){
    throw new CustomError("The user already answered the 'Entidad' instance questions", 409)
  } 

  await postRtas(proyecto, id_usuario, 1, respuestas)

  return await getEntidad(id_proyecto, id_usuario, 'evaluador')
}

const postProposito = async(id_proyecto: number, id_usuario: number, respuestas: any) => {
  const { proyecto } = await projectService.getOneProject(id_proyecto)
  const assigned = await verify_date(id_proyecto, id_usuario)

  if(!assigned.respondio_entidad) {
    throw new CustomError("The user should answer first the 'Entidad' instance questions", 409)
  }

  if(assigned.fecha_fin_eval !== null) {
    throw new CustomError("The user should answer first the 'Proposito' instance questions", 409)
  } 

  await postRtas(proyecto, id_usuario, 2, respuestas)

  return await getProposito(id_proyecto, id_usuario, 'evaluador')
}

const finalizarEvaluacion = async(id_proyecto: number, id_usuario: number) => {

  const id_inst  = await insttitutionCYTService.getInstIdFromAdmin(id_usuario)
  await projectService.getOneProject(id_proyecto, id_inst)

  const { cantidad: evaluadoresTotales} = (await knex('evaluadores_x_proyectos')
      .where({ id_proyecto })
      .count('id_evaluador as cantidad'))[0];

  const { cantidad: evaluadoresActivos} = (await knex('evaluadores_x_proyectos')
      .where({ id_proyecto, fecha_fin_eval: null })
      .count('id_evaluador as cantidad'))[0];

  //console.log('evalaudores totales:  ', evaluadoresTotales)
  //console.log('evaluadores restantes:',evaluadoresActivos)

  /*
  if(evaluadoresTotales - evaluadoresActivos< 4){
    const _error = new Error('To complete an evaluation, at least 4 evaluators are required to complete the project evaluation')
    _error.status = 409
    throw _error
  }*/

  await knex('proyectos').where({ id: id_proyecto }).update({ id_estado_eval: 4 })

  return {msg: 'Evaluacion concluida'}
}

export default {
  getEvaluationScores,

  getEntidad,
  getProposito,
  postEntidad,
  postProposito,
  finalizarEvaluacion
}