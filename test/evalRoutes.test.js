const getHeaders = require('./LoginRoutes.test.js')
const Requests = require('./Requests.js')
const assert = require('assert');

const { tests } = require('./jsons/getNextEvalTests.json')

describe('TEST EVAL ROUTES', () => {

    let header_admin_general, header_admincyt_1, header_admincyt_2, header_evaluador_1, header_evaluador_2

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
    })

    describe('GET /api/evaluacion/:id_proyecto ==> Get next eval', () => {

        tests.forEach(({ projectId, type, statusCode, msg }) => {
            const desc = statusCode ? msg : `Should get project ${type}`;
            it(desc, async () => {
                const header = (projectId === 2 && type === null) 
                    ? header_evaluador_2 
                    : header_evaluador_1;
                const res = await Requests.GET(`/api/evaluacion/${projectId}`, header, statusCode || 200)
                const eval = res.body
                if (!statusCode) {
                    assert.equal(eval.id_proyecto, projectId);
                    assert.equal(eval.type, type);
                } 
            });
        });

    })

    describe('GET /api/evaluacion/:id_proyecto/respuestas ==> Get eval project answers', () => {

        it('Should return the evaluators answers (evaluador)', async() => {
            const id_proyecto = 2
            const res = await Requests.GET(`/api/evaluacion/${id_proyecto}/respuestas`, header_evaluador_1, 200)
            const { respuestas } = res.body
            assert.equal(respuestas.name, 'Evaluación de proyecto')
        })

        it('Should return the evaluators answers (evaluador)', async() => {
            const id_proyecto = 2
            const res = await Requests.GET(`/api/evaluacion/${id_proyecto}/respuestas`, header_admincyt_1, 200)
            const { respuestas } = res.body
            assert.equal(respuestas.name, 'Evaluación de proyecto')
        })

        it('Should not find the project (status 404)', async() => {
            const id_proyecto = 4
            await Requests.GET(`/api/evaluacion/${id_proyecto}/respuestas`, header_evaluador_1, 404)
        })

        it('Should not find answers (status 404)', async() => {
            const id_proyecto = 1
            await Requests.GET(`/api/evaluacion/${id_proyecto}/respuestas`, header_evaluador_1, 404)
        })

        it('Should not allow access to responses from a project where the evaluator is not assigned (status 403)', async() => {
            const id_proyecto = 2
            const res = await Requests.GET(`/api/evaluacion/${id_proyecto}/respuestas`, header_evaluador_2, 403)
            //console.log(res.body)
        })

        it('Should not allow access to responses from a project which the admin does not own (status 403)', async() => {
            const id_proyecto = 1
            await Requests.GET(`/api/evaluacion/${id_proyecto}/respuestas`, header_admincyt_2, 403)
        })

    })

    describe('GET /api/evaluacion/:id_proyecto/respuestas/pdf ==> Get a pdf with a project evaluation summary', () => {

        it('Should generate a pdf', async() => {
            const id_proyecto = 3
            await Requests.GET(`/api/evaluacion/${id_proyecto}/respuestas/pdf`, header_admincyt_1, 200, 'application/pdf')
        })

        it('Should not generate a pdf if the evaluation has not finished yet', async() => {
            const id_proyecto = 2
            await Requests.GET(`/api/evaluacion/${id_proyecto}/respuestas/pdf`, header_admincyt_1, 404)
        })

        it('Should not generate a pdf of a project which the admin does not own', async() => {
            const id_proyecto = 2
            await Requests.GET(`/api/evaluacion/${id_proyecto}/respuestas/pdf`, header_admincyt_2, 403)
        })
    })

    describe('POST /api/evaluacion ==> Post the responses of an evaluator for a project', () => {
        
        

    })

})