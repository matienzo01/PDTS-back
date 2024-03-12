const request = require('supertest');
const server = require('../src/app');
const getHeaders = require('./LoginRoutes.test')
const assert = require('assert');

describe('TEST EVAL ROUTES', () => {

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

        async function getEval(id_proyecto, header, statusCode) {
            const res = await request(server)
                .get(`/api/evaluacion/${id_proyecto}`)
                .set(header)
                .expect(statusCode)
            return res.body
        }

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
    
    })

    describe('GET /api/evaluacion/:id_proyecto/respuestas/pdf ==> Get a pdf with a project evaluation summary', () => {
    
    })

    describe('POST /api/evaluacion ==> Post the responses of an evaluator for a project', () => {
    
    })

})