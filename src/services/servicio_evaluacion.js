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
    respuesta.id_evaluador = id_evaluador
    respuesta.id_proyecto = parseInt(id_proyecto)
    return respuesta; 

    /*
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

    */
}

module.exports = {
    getEvaluacion
}