import knex from '../database/knex'
import projectService from './project'
import insttitutionCYTService from './institutionCYT'
import { CustomError } from '../types/CustomError'
import { Indicador } from '../types/Indicador'
import { Dimension } from '../types/Dimension'
import { RespuestaEval } from '../types/RespuestaEval'
import { Proyecto } from '../types/Proyecto'
import { Participante } from '../types/Participante'
import mailer from './mailer'
import user from './user'
import institutionCYT from './institutionCYT'

const getEvaluationScores = async(id_proyecto: number) => {

  if (!await projectService.verifyState(id_proyecto, 'Evaluado')){
    throw new CustomError('El proyecto aun esta siendo evaluado. Las respuestas no están disponibles', 409)
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

const check_director_evaluation = (id_director: number, id_usuario: number, id_estado_eval: number) => {
  if(id_director != id_usuario && id_estado_eval < 3){
    throw new CustomError("El director del proyecto debe completar su evaluacion primero", 409)
  }
}

const getFecha = () => {
  const fecha = new Date()
  return `${fecha.getFullYear()}-${fecha.getMonth() + 1}-${fecha.getDate()}`
}

const getQuestionsIds = async(obligatoriedad_proposito: boolean) => {
  if (obligatoriedad_proposito){
    return await knex('indicadores as i')
    .select("i.id","i.pregunta")
    .join('dimensiones as d', 'i.id_dimension', 'd.id')
  } else {
    return await knex('indicadores as i')
    .select("i.id","i.pregunta")
    .join('dimensiones as d', 'i.id_dimension', 'd.id')
    .where({id_instancia: 1})
  }
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

    if (respuestas?.length) {
      const rtasFiltradas = respuestas.filter(rta => rta.id_indicador === newIndicador.id_indicador);
      if (rtasFiltradas.length) {
          newIndicador.respuestas = rtasFiltradas.map(({ id_indicador, ...rest }) => rest);
      }
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
      dimensiones[clave].indicadores?.map(ind => {
        ind.respuestas = ind.respuestas ? [...ind.respuestas, ...respuestasVacias] : respuestasVacias;
        return ind;
      });
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

const getBothInstances = async(id_proyecto: number, id_usuario: number, rol: string) => {
  const {Instancia: entidad} = await getEntidad(id_proyecto, id_usuario, rol)
  const {Instancia: proposito} = await getProposito(id_proyecto, id_usuario, rol)
  return { "Instancias": [entidad, proposito]}
}

const getInstanciaRtas = async(id_instancia: number, id_proyecto: number, arrayIdsEvaluadores: number[], rol: string) => {

  let query = knex('respuestas_evaluacion as re')
    .join('indicadores as i', 're.id_indicador', 'i.id')
    .join('dimensiones as d', 'i.id_dimension', 'd.id')
    .select('re.id_evaluador', 'id_indicador', 'respuesta as option', 'calificacion as value', 'justificacion')
    .where('re.id_proyecto', id_proyecto)
    .whereIn('re.id_evaluador', arrayIdsEvaluadores)
    .where('d.id_instancia', id_instancia)
    .distinct();

  if (rol === 'admin') {
    query = query
      .join('evaluadores_x_proyectos as ep', 're.id_proyecto', 'ep.id_proyecto')
      .whereNotNull('ep.fecha_fin_eval');
  }

  return await query;
}

const getIDsNoRespondieron = async(id_proyecto: number) => {
  const idsNoRespondieron = await knex('evaluadores_x_proyectos')
      .select('id_evaluador')
      .where({ id_proyecto})
      .whereNull('fecha_fin_eval')

  const arrayIds: number[] = idsNoRespondieron.map(objeto => objeto.id_evaluador)
  return arrayIds
}

const getIDsEvaluadores = async(id_proyecto: number) => {
  const participantes  = await projectService.getParticipants(id_proyecto)
  const arrayIds: number[] = []
  participantes.forEach( async(participante: Participante) => {
    arrayIds.push(participante.id)
  })
  return arrayIds
}

const verifyProject = async(id_proyecto: number, id_instancia: number, id_usuario: number | null = null) => {
  let proyecto
  if(id_usuario != null) {
    const id  = await insttitutionCYTService.getInstIdFromAdmin(id_usuario)
    proyecto = (await projectService.getOneProject(id_proyecto, id)).proyecto
  } else {
    proyecto = (await projectService.getOneProject(id_proyecto)).proyecto
  }

  if(id_instancia == 2 && !proyecto.obligatoriedad_proposito){
    throw new CustomError('La instancia de proposito no debe ser evaluada en este proyecto', 409)
  }

  return proyecto
}


const getEntidad = async(id_proyecto: number, id_usuario: number, rol: string) => {
  return await get(id_proyecto, id_usuario, rol, 'Entidad')
}

const getProposito = async(id_proyecto: number, id_usuario: number, rol: string) => {
  return await get(id_proyecto, id_usuario, rol, 'Proposito')
}

const get = async(id_proyecto: number, id_usuario: number, rol: string, instancia: string) => {
  const { id: id_instancia } = await knex('instancias').select('id').where({nombre: instancia}).first()

  if (rol === 'admin' || rol == 'admin general') { 
    await verifyProject(id_proyecto, id_instancia, rol === 'admin' ? id_usuario : undefined);
    const idsNoRespondieron = await getIDsNoRespondieron(id_proyecto)
    const idsEvaluadores = (await getIDsEvaluadores(id_proyecto)).filter(element => ! idsNoRespondieron.includes(element))
    return await getInstancia(id_instancia, instancia, rol, await getInstanciaRtas(id_instancia, id_proyecto, idsEvaluadores, rol), idsNoRespondieron)
  } else {
    const proyecto = await verifyProject(id_proyecto, id_instancia)
    await projectService.verify_date(id_proyecto, id_usuario)
    let rtas = await getInstanciaRtas(id_instancia, id_proyecto, [id_usuario], rol)
    if (id_usuario != proyecto.id_director && proyecto.id_estado_eval > 2){
      rtas = [...rtas, ...(await getInstanciaRtas(id_instancia, id_proyecto, [proyecto.id_director], 'evaluador'))]
    }
    return await getInstancia(id_instancia, instancia, rol, rtas)
  }
}

const canAnswer = async(id_proyecto: number, id_usuario: number, proyecto: Proyecto, proposito: boolean) => {
  const assigned = await projectService.verify_date(id_proyecto, id_usuario)

  // un evaluador solo puede responder si y solo si el director ya lo hizo previamente
  check_director_evaluation(proyecto.id_director, id_usuario, proyecto.id_estado_eval)

  if(!(assigned.fecha_fin_eval == null)){
    throw new CustomError("El usuario ya termino su evaluacion", 409)
  }

  if(proposito && !proyecto.obligatoriedad_proposito){
    throw new CustomError("La instancia de proposito no debe ser evaluada en este proyecto", 400)
  }

  if(proyecto.id_estado_eval == 4) {
    throw new CustomError('La evaluacion ya fue cerrada, no se pueden subir nuevas respuestas', 409)
  }
}

const saveForm = async(id_proyecto: number, id_usuario: number, respuestas: any) => {
  const { proyecto } = await projectService.getOneProject(id_proyecto)
  await canAnswer(id_proyecto, id_usuario, proyecto, await validateAnswers(respuestas))
  await postRtas(proyecto, id_usuario, respuestas)

  if (proyecto.obligatoriedad_proposito == 1) {
    return await getBothInstances(id_proyecto, id_usuario, 'evaluador')
  } else {
    return { "Instancias": [(await getEntidad(id_proyecto, id_usuario, 'evaluador')).Instancia]}
  }
  
}

const validateAnswers = async(respuestas: any) => {
  const validIds = await knex('indicadores as i')
    .join('dimensiones as d','i.id_dimension', 'd.id')
    .select('i.id', 'd.id_instancia')

  const idsRtas = respuestas.map((obj: { id_indicador: number }) => obj.id_indicador)
  if (!(idsRtas.every((id: number) => { return validIds.some(item => item.id === id) })))
    throw new CustomError('Hay respuestas que no corresponden con ningun indicador', 400)

  return idsRtas.some((id: number) => {
    return validIds.some(item => item.id === id && item.id_instancia === 2);
  });
  
}

const postRtas = async(proyecto: Proyecto, id_usuario: number, raw_respuestas: any[]) => {

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

  respuestas.forEach(async(rta) => {
    try {
      await knex('respuestas_evaluacion').insert(rta);
    } catch (error) {
      if ((error as any).code === 'ER_DUP_ENTRY') { 
        await knex('respuestas_evaluacion')
          .where({id_indicador: rta.id_indicador})
          .where({id_evaluador: rta.id_evaluador})
          .where({id_proyecto: rta.id_proyecto})
          .update(rta);
      } else {
        throw error
      }
    }
  })
}

const finalizarEvaluacion = async(id_proyecto: number, id_usuario: number, rol: string) => {
  let proyecto: any
  if( rol == 'admin') {
    ({ proyecto } = await projectService.getOneProject(id_proyecto, await insttitutionCYTService.getInstIdFromAdmin(id_usuario)))
    if(proyecto.id_estado_eval != 3){
      throw new CustomError('La evaluacion no puede ser cerrada en este momento, el director debe completarla primero', 409)
    }

    knex.transaction(async (trx: any) => {
      await trx('proyectos')
        .where({ id: id_proyecto })
        .update({ id_estado_eval: 4 })
      
      const noFinalizaron: number[] = (await trx('evaluadores_x_proyectos')
          .select('id_evaluador as id')
          .where({id_proyecto})
          .whereNull('fecha_fin_eval'))
        .map((objeto: any) => objeto.id)
      
      await trx('respuestas_evaluacion')
        .delete()
        .where({id_proyecto})
        .whereIn('id_evaluador', noFinalizaron)
    })
  } else {
    ({ proyecto } = await projectService.getOneProject(id_proyecto))        // existe el proyecto?
    const assigned = await projectService.verify_date(id_proyecto, id_usuario)  // el usuario esta linkeado al proyecto?
    check_director_evaluation(proyecto.id_director, id_usuario, proyecto.id_estado_eval)
    
    if(assigned.fecha_fin_eval != null || proyecto.id_estado_eval == 4){
      throw new CustomError('La evaluacion ya fue cerrada', 409)
    }
    
    const respuestas_guardadas = (await knex('respuestas_evaluacion')
      .select("id_indicador")
      .where({id_proyecto})
      .where({id_evaluador: id_usuario})
      .whereNotNull("justificacion")
      .where('justificacion', '!=', '')
      .whereNotNull("respuesta"))

    const total_preguntas = await getQuestionsIds(proyecto.obligatoriedad_proposito)
    const preguntas_entidad =  new Set((await getQuestionsIds(false)).map(r => r.id))
    const preguntas_proposito = new Set((total_preguntas.filter(item1 => !preguntas_entidad.has(item1.id))).map(r => r.id))

    if (respuestas_guardadas.length != total_preguntas.length ) {
      const ids_respuestas_guardadas = new Set(respuestas_guardadas.map(r => r.id_indicador));
      const preguntas_no_respondidas = {
        Entidad: total_preguntas.filter(p => !ids_respuestas_guardadas.has(p.id) && preguntas_entidad.has(p.id)),
        Proposito: total_preguntas.filter(p => !ids_respuestas_guardadas.has(p.id) && preguntas_proposito.has(p.id))
      }
      
      throw new CustomError('El numero de respuestas no coincide con las esperadas', 400, preguntas_no_respondidas)
    } 

    await knex('evaluadores_x_proyectos')
        .where({ id_proyecto: id_proyecto, id_evaluador: id_usuario })
        .update({ fecha_fin_eval: getFecha() });

    if (proyecto.id_director === id_usuario) { 
        const { institucion_CYT: inst} = await institutionCYT.getOneInstitucionCYT(proyecto.id_institucion)
        const participantes = proyecto.participantes.filter((participante: any) => participante.rol !== 'director');
        const users = await knex('evaluadores').whereIn('id', participantes.map((participante: any) => participante.id));
        users.forEach(user => mailer.ReadyToEvaluate(proyecto.titulo, user, inst));
        await knex('proyectos').where({ id: proyecto.id }).update({ id_estado_eval: 3 });
    } 

    const admins = await knex('instituciones_x_admins as ixa')
        .join('admins_cyt as a', 'a.id', 'ixa.id_admin')
        .where('ixa.id_institucion', proyecto.id_institucion)
    admins.forEach( async(admin) => {
        await mailer.finalizacionEval(admin, proyecto, await user.getOneUser(id_usuario))
    })
  }

  if (proyecto.obligatoriedad_proposito == 1) {
    return await getBothInstances(id_proyecto, id_usuario, rol)
  } else {
    return { "Instancias": [(await getEntidad(id_proyecto, id_usuario, rol)).Instancia]}
  }
}

const getResumen = async( rol: string, id_proyecto: number, id_institucion: number | null = null) => {
  let proyecto 
  if (rol == 'admin') {
    proyecto = (await projectService.getOneProject(id_proyecto, id_institucion)).proyecto
  } else {
    proyecto = (await projectService.getOneProject(id_proyecto)).proyecto
  }

  if (proyecto.id_estado_eval != 4) {
    throw new CustomError('Se puede acceder al resumen unicamente si la evaluacion fue cerrada', 409)
  }

  const idsNoRespondieron = await getIDsNoRespondieron(id_proyecto)
  const promises = [
    generateResumenInstancia(id_proyecto, 1, 'Entidad', idsNoRespondieron),
  ];

  if (proyecto.obligatoriedad_proposito) {
    promises.push(generateResumenInstancia(id_proyecto, 2, 'Proposito', idsNoRespondieron));
  }
  
  const resultados = await Promise.all(promises);
  return { Resumen: resultados.map(({ Instancia }) => Instancia) };
}

const generateResumenInstancia = async(id_proyecto: number, id_instancia: number, nombreInstancia:string, idsNoRespondieron: any[]) => {
  const dimensiones: { [nombre: string]: Dimension } = {};
  const [indicadores, options, respuestas] = await Promise.all([
    knex.select(
      'i.id as id_indicador',
      'i.pregunta',
      'i.determinante',
      'd.id as id_dimension',
      'd.nombre as nombre_dimension'
    )
      .from('indicadores as i')
      .join('dimensiones as d', 'i.id_dimension', 'd.id')
      .where({id_instancia}),
    knex('opciones_evaluacion')
      .select('id', 'peso as value')
      .where({id_instancia}),
    knex('respuestas_evaluacion as re')
      .join('indicadores as i', 're.id_indicador', 'i.id')
      .join('dimensiones as d', 'i.id_dimension', 'd.id')
      .select('re.id_evaluador', 'id_indicador', 'calificacion as value')
      .where('re.id_proyecto', id_proyecto)
      .where('d.id_instancia', id_instancia)
      .distinct()
  ])

  indicadores.forEach(row => {

    let newIndicador: Partial<Indicador> = {
      id_indicador: row.id_indicador,
      pregunta: row.pregunta,
      determinante: row.determinante
    };

    if (respuestas?.length) {
      const rtasFiltradas = respuestas.filter(rta => rta.id_indicador === newIndicador.id_indicador);
      if (rtasFiltradas.length) {
          newIndicador.respuestas = rtasFiltradas.map(({ id_indicador, ...rest }) => rest);
      }
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

  const respuestasVacias: any[]  = idsNoRespondieron.map(id => ({
    id_evaluador: id,
    value: null
  }));

  for (const clave in dimensiones) {
    dimensiones[clave].indicadores?.map(ind => {
      ind.respuestas = ind.respuestas ? [...ind.respuestas, ...respuestasVacias] : respuestasVacias;
      const valores = ind.respuestas
        .map(rta => rta.value)
        .filter(value => value !== null) as number[];
      const sumaValores = valores.reduce((acc, curr) => acc + curr, 0);
      //@ts-ignore
      ind.promedio = valores.length ? sumaValores / valores.length : null;
      return ind;
    });


  }
  
  return { Instancia: 
    {
      nombre_instancia: nombreInstancia,
      dimensiones: dimensiones, 
      opciones: options
    } 
  }
}


export default {
  getEvaluationScores,
  check_director_evaluation,
  getEntidad,
  getProposito,
  saveForm,
  getResumen,
  finalizarEvaluacion,
  validateAnswers
}