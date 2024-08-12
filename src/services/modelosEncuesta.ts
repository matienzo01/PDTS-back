import knex from'../database/knex'
import { CustomError } from '../types/CustomError';

const getAllOptions = async() => {

}

const createOption = async() => {

}

const getAllModelos = async() => {

}

const createModelo = async() => {

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

const updateModelo = async() => {

}

const deleteModelo = async() => {

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
    try {
        const id_seccion = (await knex('secciones').insert({nombre: seccion.nombre}))[0]

        await Promise.all(seccion.questions.map(async (question: any) => {
            createPregunta(id_seccion, question)
        }))

        return await getOneSeccion(id_seccion)
    } catch(error) {

    }
}

const deleteSeccion = async() => {
    
}

const createPregunta = async(id_seccion: number | null, question: any, subpregunta: boolean = false) => {
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
                const optId = option.id ? option.id : await knex('opciones').insert({valor: option.valor})
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
                const subqId = await createPregunta(null, subq, true)
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
    getAllModelos,
    getOneModelo,
    createModelo,
    deleteModelo,
    updateModelo,
    createSeccion,
    getAllSecciones,
    getOneSeccion,
    deleteSeccion
}