const Requests = require('./Requests.js')
const getHeaders = require('./LoginRoutes.test')
const assert = require('assert');

describe('TEST INSTITUTION (CYT) ROUTES', () => {

    describe('GET /api/instituciones_cyt ==> Get all institutions', async() => {

        it('Should get all institutions', async() => {
            const { header_admincyt_1} = getHeaders()
            const { instituciones_CYT } = await Requests.getInstitutionsCYT(header_admincyt_1, 200)
        })
    })

    describe('GET /api/instituciones_cyt/tipos ==> Get all institution types', async() => {
        
    })

    describe('GET /api/instituciones_cyt/:id_institucion ==> Get one institution', async() => {
        
    })

    describe('GET /api/instituciones_cyt/:id_institucion/proyectos ==> Get all institution projects', async() => {
        
    })

    describe('GET /api/instituciones_cyt/:id_institucion/proyectos/:id_proyecto ==> Get one institution project', async() => {
        
    })

    describe('GET /api/instituciones_cyt/:id_institucion/proyectos/:id_proyecto/evaluadores ==> Gell all project evaluators', async() => {
        
    })

    describe('GET /api/instituciones_cyt/:id_institucion/usuarios ==> Get all users linked to the institution', async() => {
        
    })
    
    describe('POST /api/instituciones_cyt ==> Create a new institution', async() => {
        
    })
    
    describe('POST /api/instituciones_cyt/:id_institucion/proyectos ==> Create a new project', async() => {
        
    })
    
    describe('POST /api/instituciones_cyt/:id_institucion/proyectos/:id_proyecto/evaluadores ==> Assign a evaluator to the project', async() => {
        
    })
    
    describe('POST /api/instituciones_cyt/:id_institucion/usuarios ==> Create a new evaluator user', async() => {
        
    })
    
    describe('POST /api/instituciones_cyt/:id_institucion/usuarios/vincular_usuario ==> Link an evaluator to the institution', async() => {
        
    })
    
    describe('DELETE /api/instituciones_cyt/:id_institucion ==> Delete one institution', async() => {
        
    })
    
    describe('DELETE /api/instituciones_cyt/:id_institucion/proyectos/:id_proyecto ==> Delete one project', async() => {
        
    })
    
    describe('DELETE /api/instituciones_cyt/:id_institucion/proyectos/:id_proyecto/evaluadores/:id_evaluador ==> Unassign a evaluator from a project', async() => {
        
    })

})