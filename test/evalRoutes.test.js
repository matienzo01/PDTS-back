const getHeaders = require('./LoginRoutes.test')
const Requests = require('./Requests.js')
const assert = require('assert');

const { tests } = require('./jsons/getNextEvalTests.json')

describe('TEST EVAL ROUTES', () => {

    describe('GET /api/evaluacion/:id_proyecto ==> Get next eval', () => {

        tests.forEach(({ projectId, type, statusCode, msg }) => {
            const desc = statusCode ? msg : `Should get project ${type}`;
            it(desc, async () => {
                const header = (projectId === 2 && type === null) 
                    ? getHeaders().header_evaluador_2 
                    : getHeaders().header_evaluador_1;
                const response = await Requests.getEval(projectId, header, statusCode || 200);
                if (!statusCode) {
                    assert.equal(response.id_proyecto, projectId);
                    assert.equal(response.type, type);
                } 
            });
        });

    })

    describe('GET /api/evaluacion/:id_proyecto/respuestas ==> Get eval project answers', () => {

        it('Should return the evaluators answers (evaluador)', async() => {
            const { header_evaluador_1 } = getHeaders()
            const id_proyecto = 2
            const { respuestas } = await Requests.getAnswers(id_proyecto, header_evaluador_1, 200)
            assert.equal(respuestas.name, 'Evaluación de proyecto')
        })

        it('Should return the evaluators answers (evaluador)', async() => {
            const { header_admincyt_1 } = getHeaders()
            const id_proyecto = 2
            const { respuestas } = await Requests.getAnswers(id_proyecto, header_admincyt_1, 200)
            assert.equal(respuestas.name, 'Evaluación de proyecto')
        })

        it('Should not find the project', async() => {
            const { header_evaluador_1 } = getHeaders()
            const id_proyecto = 4
            await Requests.getAnswers(id_proyecto, header_evaluador_1, 404)
        })

        it('Should not find answers', async() => {
            const { header_evaluador_1 } = getHeaders()
            const id_proyecto = 1
            await Requests.getAnswers(id_proyecto, header_evaluador_1, 404)
        })

        it('Should not allow access to responses from a project where the evaluator is not assigned', async() => {
            const { header_evaluador_2 } = getHeaders()
            const id_proyecto = 2
            await Requests.getAnswers(id_proyecto, header_evaluador_2, 403)
        })

        it('Should not allow access to responses from a project which the admin does not own', async() => {
            const { header_admincyt_2 } = getHeaders()
            const id_proyecto = 1
            await Requests.getAnswers(id_proyecto, header_admincyt_2, 403)
        })

    })

    describe('GET /api/evaluacion/:id_proyecto/respuestas/pdf ==> Get a pdf with a project evaluation summary', () => {

        it('Should generate a pdf', async() => {
            const { header_admincyt_1 } = getHeaders()
            const id_proyecto = 3
            const res = await Requests.getPdf(id_proyecto, header_admincyt_1, 200)
            assert.equal(res.type, 'application/pdf')
        })

        it('Should not generate a pdf if the evaluation has not finished yet', async() => {
            const { header_admincyt_1 } = getHeaders()
            const id_proyecto = 2
            const res = await Requests.getPdf(id_proyecto, header_admincyt_1, 404)
            assert.equal(res.type, 'application/json')
        })

        it('Should not generate a pdf of a project which the admin does not own', async() => {
            const { header_admincyt_2 } = getHeaders()
            const id_proyecto = 2
            const res = await Requests.getPdf(id_proyecto, header_admincyt_2, 403)
            assert.equal(res.type, 'application/json')
        })
    })

    describe('POST /api/evaluacion ==> Post the responses of an evaluator for a project', () => {
        
        

    })

})