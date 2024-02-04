const gen_consulta = require('../database/gen_consulta')
const TABLA = ''

const respuesta = {
    tipo: 'evaluacion',
    id_evaluador : 1,
    id_proyecto : 2,
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

const getEvaluacion = async (id_proyecto,id_evaluador) => {
    //aca haria la consulta a la bd
    respuesta.id_evaluador = id_evaluador
    respuesta.id_proyecto = id_proyecto
    return respuesta
    
}

module.exports = {
    getEvaluacion
}