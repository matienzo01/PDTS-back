import knex from'../database/knex'
import { CustomError } from '../types/CustomError';

const getAllOptions = async() => {
    return { options: await knex('opciones').select()}
}

const createOption = async(option: any) => {
    const op = await knex('opciones').select().where({valor: option.valor}).first()
    return op == undefined ? await knex('opciones').insert({valor: option.valor}) : op.id
}

const getAllModelos = async() => {
    const modelos = await knex('modelos_encuesta').select()

    for (const modelo of modelos) {
        const ids = await knex('modelos_x_secciones')
            .select('id_seccion as id')
            .where({ id_modelo: modelo.id });
    
        modelo.secciones = await Promise.all(ids.map(async ({ id }) => {
            const { section } = await getOneSeccion(id);
            return section;
        }));
    }

    return {modelos: modelos}
}

const getOneModelo = async(id_modelo: number) => {
    const modelo = await knex('modelos_encuesta').select().where({id: id_modelo}).first()
    
    if(modelo == undefined) {
        throw new CustomError('No existe un modelo de encuesta con el id dado', 404)
    }

    const ids = await knex('modelos_x_secciones').select('id_seccion as id').where({id_modelo})

    const secciones = await Promise.all(ids.map(async ({ id }) => {
        const { section } = await getOneSeccion(id)
        return section
    }))

    return {    
        model: {
            name: modelo.nombre,
            modelId: modelo.id,
            editable: modelo.editable,
            sections: secciones
        }
    }
}

const checkSecciones = async(secciones: number[]) => {
    const seccionesExitentes = (await knex('secciones').select('id').whereIn('id', secciones)).map(seccion => seccion.id)
    
    const noExistentes = secciones.filter((seccion: number) => !seccionesExitentes.includes(seccion))
    if(noExistentes.length > 0) {
        throw new CustomError(`Algunos de los ids de secciones dados dentro del modelo no existen en el sistema. ids: [${noExistentes}]`, 404)
    }
}

const createModelo = async(modelo: any) => {
    if(await knex('modelos_encuesta').select().where('nombre', modelo.nombre).first()) {
        throw new CustomError('Ya existe un modelo con el mismo nombre', 409)
    }

    await checkSecciones(modelo.secciones)

    const modeloId = (await knex('modelos_encuesta').insert({nombre: modelo.nombre}))[0]
    for (const seccionId of modelo.secciones) {
        await knex('modelos_x_secciones').insert({id_seccion: seccionId, id_modelo: modeloId})
    }
    return await getOneModelo(modeloId)
}

const updateModelo = async(id_modelo: number, updatedModelo: any) => {
    const modelo = await knex('modelos_encuesta').select().where({id: id_modelo}).first()
    
    if(!modelo) {
        throw new CustomError('No existe un modelo con el id dado', 404)
    }

    if(!modelo.editable){
        throw new CustomError('El modelo ya no es editable', 409)
    }

    if(modelo.nombre != updatedModelo.nombre) {
        await knex('modelos_encuesta').update({nombre: updatedModelo.nombre})
    }

    await checkSecciones(updatedModelo.secciones)
    
    const currentSecciones = await knex('modelos_x_secciones')
        .where({ id_modelo })
        .pluck('id_seccion');
    
    const seccionesToRemove = currentSecciones.filter(seccion => !updatedModelo.secciones.includes(seccion));
    const seccionesToAdd = updatedModelo.secciones.filter((seccion: any) => !currentSecciones.includes(seccion));

    if (seccionesToRemove.length > 0) {
        await knex('modelos_x_secciones')
            .where({ id_modelo })
            .whereIn('id_seccion', seccionesToRemove)
            .delete();
    }

    if (seccionesToAdd.length > 0) {
        const inserts = seccionesToAdd.map((id_seccion: number) => ({ id_seccion, id_modelo }));
        await knex('modelos_x_secciones').insert(inserts);
    }
    console.log(id_modelo)
    return await getOneModelo(id_modelo)
}

const finalizarModelo = async(id_modelo: number) => {
    const modelo = await knex('modelos_encuesta').select().where({id: id_modelo}).first()
    
    if(!modelo) {
        throw new CustomError('No existe un modelo con el id dado', 404)
    }

    if(!modelo.editable){
        throw new CustomError('El modelo ya fue finalizado', 409)
    }

    await knex('modelos_encuesta').update({editable: false}).where({id : id_modelo})

    return await getOneModelo(id_modelo)
}

const setOptions = (pregunta: any, opciones: any, opciones_preguntas: any) => {
    return opciones
        .filter((opcion: any) => opciones_preguntas
            .filter((item: any) => item.id_preguntas_seccion === pregunta.questionId)
            .map((item: any) => item.id_opcion)
            .includes(opcion.id))
}

const getAllSecciones = async() => {
    const ids = await knex('secciones').select('id')
    const secciones = await Promise.all(ids.map(async ({ id }) => {
        const { section } = await getOneSeccion(id)
        return section
    }))
    return {
        sections: secciones
    }
}

const getOneSeccion = async(id_seccion: number | string) => {
    const seccion = await knex('secciones').select().where({id: id_seccion}).first()
    if(seccion == undefined) {
        throw new CustomError(`No existe una seccion de encuesta con el id dado ${id_seccion}`, 404)
    }

    const preguntas = await knex('preguntas_seccion')
        .select('pregunta as label', 'id as questionId', 'id_tipo_pregunta as typeId')
        .where({id_seccion: id_seccion})
    const ids = preguntas.map(pregunta => pregunta.questionId);
    const rel_subpreg = await knex('relacion_subpregunta').select().whereIn('id_pregunta_padre', ids)
    const sub_preguntas = await knex('preguntas_seccion')
        .select('pregunta as label', 'id as questionId', 'id_tipo_pregunta as typeId')
        .whereIn('id', rel_subpreg.map( rel => rel.id_subpregunta))
    const tipos = await knex('tipo_preguntas').select()
    
    const opciones_preguntas = await knex('opciones_x_preguntas')
        .select()
        .whereIn('id_preguntas_seccion',ids.concat(sub_preguntas.map(pregunta => pregunta.questionId)))

    const opciones = await knex('opciones')
        .select()
        .whereIn('id', opciones_preguntas
            .map(item => item.id_opcion)
            .filter((value, index, self) => self.indexOf(value) === index)
        )

    const preguntasConSubPreguntas = preguntas.map(pregunta => {
        const subQuestions = sub_preguntas.filter(subPregunta => {
            subPregunta.type = tipos.filter(t => t.id == subPregunta.typeId)[0].tipo
            subPregunta.options = setOptions(subPregunta, opciones, opciones_preguntas)
            return rel_subpreg.some(rel => rel.id_pregunta_padre === pregunta.questionId && rel.id_subpregunta === subPregunta.questionId)
        })

        const type = tipos.filter(t => t.id == pregunta.typeId)[0].tipo
        const options = setOptions(pregunta, opciones, opciones_preguntas)
        
        return {
          ...pregunta,
          type,
          options,
          subQuestions
        };
    });

    return { 
        section: {
            sectionId: seccion.id,
            name: seccion.nombre,
            questions: preguntasConSubPreguntas
        }
    }
}

const createSeccion = async(seccion: any) => {
    if( await knex('secciones').select().where({nombre: seccion.nombre}).first()) {
        throw new CustomError('Ya existe un modelo de encuesta con el mismo nombre', 409)
    }
 
    const id_seccion = (await knex('secciones').insert({nombre: seccion.nombre}))[0]

    await Promise.all(seccion.questions.map(async (question: any) => {
        await createPregunta(id_seccion, question)
    }))

    return await getOneSeccion(id_seccion)
}

const deleteSeccion = async(id_seccion: number) => {
    if( (await knex('secciones').select().where({id: id_seccion}).first()) == undefined) {
        throw new CustomError('No existe una seccion con el id dado', 404)
    }

    const modelos = await knex('modelos_x_secciones as ms')
        .select('me.editable')
        .join('modelos_encuesta as me', 'me.id', 'ms.id_modelo')
        .where('ms.id_seccion', id_seccion)

    if (modelos.length > 0 && !modelos.every(item => item.editable === 1)) {
        throw new CustomError('La sección no puede ser eliminada ya que pertenece a un modelo de encuesta que ya no es editable', 409);
    }

    await knex.transaction(async (trx) => {
        const ids = (await trx('preguntas_seccion as p')
            .select('p.id')
            .leftJoin('relacion_subpregunta as rsp', 'p.id', 'rsp.id_pregunta_padre')
            .leftJoin('preguntas_seccion as sp', 'rsp.id_subpregunta', 'sp.id')
            .where('p.id_seccion', id_seccion)
            .union(function() {
                this.select('sp.id')
                    .from('preguntas_seccion as p')
                    .leftJoin('relacion_subpregunta as rsp', 'p.id', 'rsp.id_pregunta_padre')
                    .leftJoin('preguntas_seccion as sp', 'rsp.id_subpregunta', 'sp.id')
                    .where('p.id_seccion', id_seccion);
            })).map( obj => obj.id)

        await trx('modelos_x_secciones').delete().where({ id_seccion });
        await trx('opciones_x_preguntas').delete().whereIn('id_preguntas_seccion', ids);
        await trx('relacion_subpregunta').delete().whereIn('id_pregunta_padre', ids);
        await trx('preguntas_seccion').delete().whereIn('id', ids);
        await trx('secciones').delete().where({ id: id_seccion });
    });

    return await getAllSecciones(); 
}

const createPregunta = async(id_seccion: number | null, question: any) => {
    try {
        const questionId = (await knex('preguntas_seccion')
            .insert({
                pregunta: question.label,
                id_seccion: id_seccion,
                id_tipo_pregunta: question.typeId
            })
        )[0]
        
        if (question.typeId == 1) {//multiple choice
            question.options.map( async (option: any) => {
                const optId = option.id ? option.id : await createOption(option)
                await knex('opciones_x_preguntas')
                    .insert({
                        id_opcion: optId, 
                        id_preguntas_seccion: questionId
                    })
            })
        }

        // si es tipo 3 y requiere completar el campo de texto => hay que agregar una subpregunta de texto

        if(question.subQuestions) {
            await Promise.all(question.subQuestions.map(async ( subq: any) => {
                const subqId = await createPregunta(null, subq)
                await knex('relacion_subpregunta').insert({
                    id_pregunta_padre: questionId, 
                    id_subpregunta: subqId
                })
            }))
        }
        
        return questionId
    } catch(error) {
        throw error;
    }     
}

export default {
    getAllOptions,
    getAllModelos,
    getOneModelo,
    createModelo,
    updateModelo,
    finalizarModelo,
    
    createSeccion,
    getAllSecciones,
    getOneSeccion,
    deleteSeccion
}