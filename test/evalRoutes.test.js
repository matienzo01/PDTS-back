const getHeaders = require('./LoginRoutes.test.js')
const Requests = require('./Requests.js')
const assert = require('assert');
const newInstData = require('./InstitutionCYTRoutes_1.test.js')

const {
    InstanciaAttributes,
    EntidadDimAttributes,
    PropositoDimAttributes,
    DimAttributes,
    IndicadorAttributes,
    OptionAttributes,
    IndicadorWAnswerAttributes } = require('./jsons/expectedAttributes/EvalAttributes.json')

const respuestasEval = require('./jsons/newData/respuestasEval.json')

describe('TEST EVAL ROUTES', () => {

    let header_admin_general, header_admincyt_1, header_admincyt_2, header_evaluador_1, header_evaluador_2
    let header_new_admincyt, header_new_evaluador, newInstitutionId, newEvaluadorId, newProjectId, newEvaluatorCredentials

    before( async() => {
        const {
        header_admin_general: ag, 
        header_admincyt_1: a1, 
        header_admincyt_2: a2, 
        header_evaluador_1: e1,
        header_evaluador_2: e2
        } = getHeaders()

        header_admin_general = ag
        header_admincyt_1 = a1
        header_admincyt_2 = a2
        header_evaluador_1 = e1
        header_evaluador_2 = e2

        header_new_admincyt = newInstData.getNewAdminHeader()
        header_new_evaluador = newInstData.getNetEvaluadorHeader()
        newInstitutionId = newInstData.getNewInstitutionId()
        newProjectId = newInstData.getNewProjectId()
        newEvaluadorId = newInstData.getNewEvaluatorId()
        newEvaluatorCredentials = newInstData.getNewEvaluatorCredentials()
    })

    const verifyInstancia = (name, instancia, EDAttributes, IndAttributes, allowedIds = [], canSee = false) => {
        const { verifyAttributes } = Requests;
    
        verifyAttributes(`Instancia ${name}`, instancia, InstanciaAttributes);
        const { opciones, dimensiones } = instancia;
        verifyAttributes(`Dimensiones ${name}`, dimensiones, EDAttributes);
        
        opciones.forEach(o => verifyAttributes("opcion", o, OptionAttributes));
        const opcionesValidas = opciones.map(o => `${o.option}-${o.value}`);
    
        for (const dimension in dimensiones) {
            const dim = dimensiones[dimension];
            verifyAttributes(`Dimension: ${dimension}`, dim, DimAttributes);
            dim.indicadores.forEach(i => {
                verifyAttributes('indicador', i, IndAttributes);
                if (allowedIds.length > 0) {
                    const isValid = i.respuestas.every(respuesta => {
                        const isCommonCond = allowedIds.includes(respuesta.id_evaluador);
                        if (canSee) {
                            return opcionesValidas.includes(`${respuesta.option}-${respuesta.value}`) &&
                                typeof respuesta.justificacion === 'string' &&
                                respuesta.justificacion.trim() !== '' &&
                                isCommonCond;
                        } else {
                            return respuesta.justificacion === null &&
                                respuesta.option === null &&
                                respuesta.value === null &&
                                isCommonCond;
                        }
                    });
                    const errorMsg = canSee 
                        ? `Las respuestas del indicador "${i.pregunta}" tienen una opcion invalida, no tienen justificacion o no pertenecen a un evaluador asociado al proyecto`
                        : `Las respuestas del indicador "${i.pregunta}" son distintas a null o no pertenecen a un evaluador asociado al proyecto`;
    
                    if (!isValid) {
                        assert(false, errorMsg);
                    }
                }
            });
        }
    };

    describe('Project in state 2 (en evaluacion por el director)', () => {

        it('El director debe tener acceso al formulario de evaluacion (Entidad)', async() => {
            const res = await Requests.GET(`/api/evaluacion/entidad/${newProjectId}`, header_new_evaluador, 200)
            verifyInstancia("Entidad", res.body.Instancia, EntidadDimAttributes, IndicadorAttributes)
        })

        it('El director debe tener acceso al formulario de evaluacion (Proposito)', async() => {
            const res = await Requests.GET(`/api/evaluacion/proposito/${newProjectId}`, header_new_evaluador, 200)
            verifyInstancia("Proposito", res.body.Instancia, PropositoDimAttributes, IndicadorAttributes)
        })

        it('El director debe ser capaz de completar el formulario', async() => {
            const res = await Requests.POST(`/api/evaluacion/form/${newProjectId}`, header_new_evaluador, 200, respuestasEval)
            verifyInstancia("Entidad", res.body.Instancias[0], EntidadDimAttributes, IndicadorWAnswerAttributes)
            verifyInstancia("Proposito", res.body.Instancias[1], PropositoDimAttributes, IndicadorWAnswerAttributes)
        })

        it('Un administrador no debe poder ver las respuestas hasta que se finalice la evaluacion', async() => {
            const res1 = await Requests.GET(`/api/evaluacion/entidad/${newProjectId}`, header_new_admincyt, 200)
            const res2 = await Requests.GET(`/api/evaluacion/proposito/${newProjectId}`, header_new_admincyt, 200)
            const allowedIds = [1, newEvaluadorId]
            verifyInstancia("Entidad", res1.body.Instancia, EntidadDimAttributes, IndicadorWAnswerAttributes, allowedIds);
            verifyInstancia("Proposito", res2.body.Instancia, PropositoDimAttributes, IndicadorWAnswerAttributes, allowedIds);
        })

        it('Un evaluador no deberia poder completar el formulario', async() => {
            await Requests.POST(`/api/evaluacion/form/${newProjectId}`, header_evaluador_1, 409, respuestasEval)
        })

        it('El director debe ser capaz de finalizar su evaluacion', async() => {
            const res = await Requests.PUT(`/api/evaluacion/${newProjectId}/finalizar`, header_new_evaluador, 200, {})
            const allowedIds = [newEvaluadorId]
            verifyInstancia("Entidad", res.body.Instancias[0], EntidadDimAttributes, IndicadorWAnswerAttributes, allowedIds, true)
            verifyInstancia("Proposito", res.body.Instancias[1], PropositoDimAttributes, IndicadorWAnswerAttributes, allowedIds, true)
        })
        
        it('El director no deberia poder completar el formulario una vez finalizada la evaluacion', async() => {
            await Requests.POST(`/api/evaluacion/form/${newProjectId}`, header_new_evaluador, 409, respuestasEval)
        })

        it('El director no deberia ser capaz de finalizar su evaluacion nuevamente', async() => {
            await Requests.PUT(`/api/evaluacion/${newProjectId}/finalizar`, header_new_evaluador, 409, {})
        })
    })

    describe('Project in state 3 (en evaluacion por evaluadores)', () => {

        it('Un director deberia poder ver sus respuestas de la evaluacion', async() => {

        })

        it('Un director debe ser capaz de completar la encuesta del sistema', async() => {

        })

        it('Un evaluador debe ser capaz de completar el formulario', async() => {

        })

        it('Un administrador no debe poder ver las respuestas del evaluador hasta que se finalice la evaluacion', async() => {

        })

        it('Un evaluador debe ser capaz de finalizar su evaluacion', async() => {

        })

        it('Un administrador deberia poder ver las respuestas del director y evaluador', async() => {

        })

        it('Un administrador deberia poder cerrar definitivamente la evaluacion del proyecto', async() => {

        })

    })

    describe('Project in state 4 (evaluado)', () => {

        it('Un director debe ser capaz de finalizar su encuesta', async() => {

        })

        it('Un evaluador debe ser capaz de completar su encuesta', async() => {

        })

        it('Un evaluador debe ser capaz de finalizar su encuesta', async() => {

        })

        it('El administrador general debe ser capaz de ver los promedios de la encuesta del sistema', async() => {

        })

    })

})