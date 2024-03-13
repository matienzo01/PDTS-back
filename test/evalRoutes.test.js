const request = require('supertest');
const server = require('../src/app');
const getHeaders = require('./LoginRoutes.test')
const assert = require('assert');

describe('TEST EVAL ROUTES', () => {

    async function getEval(id_proyecto, header, statusCode) {
        const res = await request(server)
          .get(`/api/evaluacion/${id_proyecto}`)
          .set(header)
          .expect(statusCode)
        assert.equal(res.type, 'application/json')
        return res.body
    }

    async function getAnswers(id_proyecto, header, statusCode) {
        const res = await request(server)
          .get(`/api/evaluacion/${id_proyecto}/respuestas`)
          .set(header)
          .expect(statusCode)
        assert.equal(res.type, 'application/json')
        return res.body
    }

    describe('GET /api/evaluacion/:id_proyecto ==> Get next eval', () => {
        
        const { header_evaluador_1, header_evaluador_2 } = getHeaders();
        console.log(header_evaluador_1)

        const tests = [
            { projectId: 1, type: 'evaluacion' },
            { projectId: 2, type: 'opinion' },
            { projectId: 3, type: null, statusCode: 409, msg: 'Should have nothing else to answer (status 409)' },
            { projectId: 450, type: null, statusCode: 404, msg: 'Should not find the provided id (status 404)' },
            { projectId: 2, type: null, statusCode: 403, msg: 'Should not let access to the evaluation of a project to which the evaluator is not assigned (status 403)' }
        ];

        tests.forEach(({ projectId, type, statusCode, msg }) => {
            const desc = statusCode ? msg : `Should get project ${type}`;
            it(desc, async () => {
                const header = (projectId === 2 && type === null) 
                    ? getHeaders().header_evaluador_2 
                    : getHeaders().header_evaluador_1;
                const response = await getEval(projectId, header, statusCode || 200);
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
            const { respuestas } = await getAnswers(id_proyecto, header_evaluador_1, 200)
            assert.equal(respuestas.name, 'Evaluación de proyecto')
        })

        it('Should return the evaluators answers (evaluador)', async() => {
            const { header_admincyt_1 } = getHeaders()
            const id_proyecto = 2
            const { respuestas } = await getAnswers(id_proyecto, header_admincyt_1, 200)
            assert.equal(respuestas.name, 'Evaluación de proyecto')
        })

        it('Should not find the project', async() => {
            const { header_evaluador_1 } = getHeaders()
            const id_proyecto = 4
            await getAnswers(id_proyecto, header_evaluador_1, 404)
        })

        it('Should not find answers', async() => {
            const { header_evaluador_1 } = getHeaders()
            const id_proyecto = 1
            await getAnswers(id_proyecto, header_evaluador_1, 404)
        })

        it('Should not allow access to responses from a project where the evaluator is not assigned', async() => {
            const { header_evaluador_2 } = getHeaders()
            const id_proyecto = 2
            await getAnswers(id_proyecto, header_evaluador_2, 403)
        })

        it('Should not allow access to responses from a project which the admin does not own', async() => {
            const { header_admincyt_2 } = getHeaders()
            const id_proyecto = 1
            await getAnswers(id_proyecto, header_admincyt_2, 403)
        })

    })

    describe('GET /api/evaluacion/:id_proyecto/respuestas/pdf ==> Get a pdf with a project evaluation summary', () => {
        
        async function getPdf(id_proyecto, header, statusCode, type) {
            const res = await request(server)
              .get(`/api/evaluacion/${id_proyecto}/respuestas/pdf`)
              .set(header)
              .expect(statusCode)
            return res
        }

        it('Should generate a pdf', async() => {
            const { header_admincyt_1 } = getHeaders()
            const id_proyecto = 3
            const res = await getPdf(id_proyecto, header_admincyt_1, 200)
            assert.equal(res.type, 'application/pdf')
        })

        it('Should not generate a pdf if the evaluation has not finished yet', async() => {
            const { header_admincyt_1 } = getHeaders()
            const id_proyecto = 2
            const res = await getPdf(id_proyecto, header_admincyt_1, 404)
            assert.equal(res.type, 'application/json')
        })

        it('Should not generate a pdf of a project which the admin does not own', async() => {
            const { header_admincyt_2 } = getHeaders()
            const id_proyecto = 2
            const res = await getPdf(id_proyecto, header_admincyt_2, 403)
            assert.equal(res.type, 'application/json')
        })
    })

    describe('POST /api/evaluacion ==> Post the responses of an evaluator for a project', () => {
    
    })

})