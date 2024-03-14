const Requests = require('./Requests.js')
const getHeaders = require('./LoginRoutes.test.js')
const assert = require('assert');

const { expectedAttributes } = require('./jsons/InstCYTAttributes.json')
const newInstCYT = require('./jsons/newInstCYT.json')

describe('TEST INSTITUTION (CYT) ROUTES - PART 1', () => {

    describe('GET /api/instituciones_cyt ==> Get all institutions', async() => {

        it('Should get all institutions (admin cyt)', async() => {
            const { header_admincyt_1} = getHeaders()
            const res = await Requests.GET('/api/instituciones_cyt', header_admincyt_1, 200)
            const { instituciones_CYT } = res.body
            instituciones_CYT.forEach(inst => {
                Requests.verifyAttributes(inst, expectedAttributes)
            });
        })

        it('Should get all institutions (admin general)', async() => {
            const { header_admin_general} = getHeaders()
            const res = await Requests.GET('/api/instituciones_cyt', header_admin_general, 200)
            const { instituciones_CYT } = res.body
            instituciones_CYT.forEach(inst => {
                Requests.verifyAttributes(inst, expectedAttributes)
            });
        })

        it('Should be unauthorized for evaluadores (status 403)', async() => {
            const { header_evaluador_1} = getHeaders()
            await Requests.GET('/api/instituciones_cyt', header_evaluador_1, 403)
        })

    })

    describe('GET /api/instituciones_cyt/tipos ==> Get all institution types', async() => {
        
        it('Should get all institutions (admin cyt)', async() => {
            const { header_admincyt_1} = getHeaders()
            const res = await Requests.GET('/api/instituciones_cyt/tipos', header_admincyt_1, 200)
            const { tipos } = res.body
            tipos.forEach(tipo => {
                Requests.verifyAttributes(tipo, ['id', 'tipo'])
            });
        })

        it('Should get all institutions (admin general)', async() => {
            const { header_admin_general} = getHeaders()
            const res = await Requests.GET('/api/instituciones_cyt/tipos', header_admin_general, 200)
            const { tipos } = res.body
            tipos.forEach(tipo => {
                Requests.verifyAttributes(tipo, ['id', 'tipo'])
            });
        })

        it('Should be unauthorized for evaluadores (status 403)', async() => {
            const { header_evaluador_1} = getHeaders()
            const res = await Requests.GET('/api/instituciones_cyt/tipos', header_evaluador_1, 403)
        })

    })

    describe('POST /api/instituciones_cyt ==> Create a new institution', async() => {
        
        it('hould create a new institution (admin general)', async() => {
            const { header_admin_general} = getHeaders()
            const res = await Requests.POST('/api/instituciones_cyt', header_admin_general, 200, newInstCYT)
            const { institucion_CYT } = res.body
            console.log(institucion_CYT);
            Requests.verifyAttributes(institucion_CYT, expectedAttributes)
        })

    })

    describe('GET /api/instituciones_cyt/:id_institucion ==> Get one institution', async() => {
        
        it('Should get all institutions (admin cyt)', async() => {
            const { header_admincyt_1} = getHeaders()
            const id_inst = 1
            const res = await Requests.GET(`/api/instituciones_cyt/${id_inst}`, header_admincyt_1, 200)
            const { institucion_CYT } = res.body
            Requests.verifyAttributes(institucion_CYT, expectedAttributes)
        })

        it('Should get all institutions (admin general)', async() => {
            const { header_admin_general} = getHeaders()
            const id_inst = 1
            const res = await Requests.GET(`/api/instituciones_cyt/${id_inst}`, header_admin_general, 200)
            const { institucion_CYT } = res.body
            Requests.verifyAttributes(institucion_CYT, expectedAttributes)
        })

        it('Should be unauthorized for evaluadores (status 403)', async() => {
            const { header_evaluador_1} = getHeaders()
            const id_inst = 1
            await Requests.GET(`/api/instituciones_cyt/${id_inst}`, header_evaluador_1, 403)
        })

        it('Should not find the institution (status 404)', async() => {
            const { header_admin_general} = getHeaders()
            const id_inst = 15000
            await Requests.GET(`/api/instituciones_cyt/${id_inst}`, header_admin_general, 404)
        })

        it('Should be a bad request (status 400)', async() => {
            const { header_admin_general} = getHeaders()
            const id_inst = 'a'
            await Requests.GET(`/api/instituciones_cyt/${id_inst}`, header_admin_general, 400)
        })

    })

    describe('POST /api/instituciones_cyt/:id_institucion/usuarios ==> Create a new evaluator user', async() => {
        
    })

    describe('POST /api/instituciones_cyt/:id_institucion/usuarios/vincular_usuario ==> Link an evaluator to the institution', async() => {
        
    })

    describe('GET /api/instituciones_cyt/:id_institucion/usuarios ==> Get all users linked to the institution', async() => {
        
    })

    describe('POST /api/instituciones_cyt/:id_institucion/proyectos ==> Create a new project', async() => {
        
    })
    
    describe('POST /api/instituciones_cyt/:id_institucion/proyectos/:id_proyecto/evaluadores ==> Assign a evaluator to the project', async() => {
        
    })

    describe('GET /api/instituciones_cyt/:id_institucion/proyectos/:id_proyecto/evaluadores ==> Gell all project evaluators', async() => {
        
    })
    
    describe('DELETE /api/instituciones_cyt/:id_institucion/proyectos/:id_proyecto/evaluadores/:id_evaluador ==> Unassign a evaluator from a project', async() => {
        
    })

    describe('GET /api/instituciones_cyt/:id_institucion/proyectos ==> Get all institution projects', async() => {
        
    })


    describe('GET /api/instituciones_cyt/:id_institucion/proyectos/:id_proyecto ==> Get one institution project', async() => {
        
    })

    
    
    describe('DELETE /api/instituciones_cyt/:id_institucion/proyectos/:id_proyecto ==> Delete one project', async() => {
        
    })

    describe('DELETE /api/instituciones_cyt/:id_institucion ==> Delete one institution', async() => {
        
    })

})