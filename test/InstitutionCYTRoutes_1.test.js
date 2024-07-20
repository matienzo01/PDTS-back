const Requests = require('./Requests.js')
const getHeaders = require('./LoginRoutes.test.js')
const assert = require('assert');

const { expectedAttributes: InstCytAttributes } = require('./jsons/expectedAttributes/InstCYTAttributes.json')
const { expectedAttributes: UserAttributes } = require('./jsons/expectedAttributes/userAttributes2.json')
const { expectedAttributes: ProjectAttributes } = require('./jsons/expectedAttributes/ProjectAttributes.json')
const { expectedAttributes: linkedUserToProjectAtt } = require('./jsons/expectedAttributes/linkedUserToProjectAtt.json')
const { expectedAttributes: projectEvaluatorsAtt } = require('./jsons/expectedAttributes/ProjectEvaluatorsAtt.json')

const newInstCYT = require('./jsons/newData/newInstCYT.json')
const newUser = require('./jsons/newData/newUser.json');
const newProject = require('./jsons/newData/newProject.json');

let header_newAdmin
let header_newEvaluador
let newInstitutionId 
let newEvaluadorId
let newProjectId
let newEvaluatorCredentials
let pathInforme

const getNewAdminHeader = () => { return header_newAdmin }
const getNetEvaluadorHeader = () => { return header_newEvaluador }
const getNewInstitutionId = () => { return newInstitutionId }
const getNewProjectId = () => { return newProjectId }
const getNewEvaluatorId = () => { return newEvaluadorId }
const getNewEvaluatorCredentials = () => { return newEvaluatorCredentials}

describe('TEST INSTITUTION (CYT) ROUTES - PART 1', () => {

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


    describe('GET /api/instituciones_cyt ==> Get all institutions', async() => {

        it('Should get all institutions (admin cyt)', async() => {
            const res = await Requests.GET('/api/instituciones_cyt', header_admincyt_1, 200)
            const { instituciones_CYT } = res.body
            instituciones_CYT.forEach(inst => {
                Requests.verifyAttributes("institucion cyt",inst, InstCytAttributes)
            });
        })

        it('Should get all institutions (admin general)', async() => {
            const res = await Requests.GET('/api/instituciones_cyt', header_admin_general, 200)
            const { instituciones_CYT } = res.body
            instituciones_CYT.forEach(inst => {
                Requests.verifyAttributes("institucion cyt",inst, InstCytAttributes)
            });
        })

        it('Should be unauthorized (evaluador) (status 403)', async() => {
            await Requests.GET('/api/instituciones_cyt', header_evaluador_1, 403)
        })

    })

    describe('POST /api/instituciones_cyt ==> Create a new institution', async() => {

        it('Should create a new institution (admin general)', async() => {
            const res = await Requests.POST('/api/instituciones_cyt', header_admin_general, 200, newInstCYT)
            const { institucion_CYT } = res.body
            newInstitutionId = institucion_CYT.id
            Requests.verifyAttributes("institucion cyt",institucion_CYT, InstCytAttributes)

            const credentials = {
                "email": newInstCYT.admin.email,
                "password": newInstCYT.admin.dni
            }

            const res2 = await Requests.POST('/api/login', null, 200, credentials)
            const { token } = res2.body
            header_newAdmin = { 'Authorization': `Bearer ${token}` }
        })

        it('Should be unauthorized (admin cyt) (status 403)', async() => {
            const resprev = await Requests.GET('/api/instituciones_cyt', header_admincyt_1, 200)
            await Requests.POST('/api/instituciones_cyt', header_admincyt_1, 403, newInstCYT)
            const respost = await Requests.GET('/api/instituciones_cyt', header_admincyt_1, 200)
            assert.equal(resprev.body.instituciones_CYT.length, respost.body.instituciones_CYT.length)
        })

        it('Should be unauthorized (evaluador) (status 403)', async() => {
            const resprev = await Requests.GET('/api/instituciones_cyt', header_admin_general, 200)
            await Requests.POST('/api/instituciones_cyt', header_evaluador_1, 403, newInstCYT)
            const respost = await Requests.GET('/api/instituciones_cyt', header_admin_general, 200)
            assert.equal(resprev.body.instituciones_CYT.length, respost.body.instituciones_CYT.length)
        })

        it('Should be a bad request (empty object) (status 400)', async() => {
            const resprev = await Requests.GET('/api/instituciones_cyt', header_admin_general, 200)
            await Requests.POST('/api/instituciones_cyt', header_admin_general, 400, {})
            const respost = await Requests.GET('/api/instituciones_cyt', header_admin_general, 200)
            assert.equal(resprev.body.instituciones_CYT.length, respost.body.instituciones_CYT.length)
        })

        it('Should be a bad request (missing admin) (status 400)', async() => {
            const resprev = await Requests.GET('/api/instituciones_cyt', header_admin_general, 200)
            await Requests.POST('/api/instituciones_cyt', header_admin_general, 400, { "institucion":"a" })
            const respost = await Requests.GET('/api/instituciones_cyt', header_admin_general, 200)
            assert.equal(resprev.body.instituciones_CYT.length, respost.body.instituciones_CYT.length)
        })

        it('Should be a bad request (missing inst) (status 400)', async() => {
            const resprev = await Requests.GET('/api/instituciones_cyt', header_admin_general, 200)
            await Requests.POST('/api/instituciones_cyt', header_admin_general, 400, { "admin":"a" })
            const respost = await Requests.GET('/api/instituciones_cyt', header_admin_general, 200)
            assert.equal(resprev.body.instituciones_CYT.length, respost.body.instituciones_CYT.length)
        })

        it('Should be a bad request (missing fields) (status 400)', async() => {
            const resprev = await Requests.GET('/api/instituciones_cyt', header_admin_general, 200)
            await Requests.POST('/api/instituciones_cyt', header_admin_general, 400, {"institucion":"a", "admin":"a" })
            const respost = await Requests.GET('/api/instituciones_cyt', header_admin_general, 200)
            assert.equal(resprev.body.instituciones_CYT.length, respost.body.instituciones_CYT.length)
        })

    })
    
    describe('GET /api/instituciones_cyt/:id_institucion ==> Get one institution', async() => {
        
        it('Should get one institution (admin cyt)', async() => {
            const id_inst = 1
            const res = await Requests.GET(`/api/instituciones_cyt/${id_inst}`, header_admincyt_1, 200)
            const { institucion_CYT } = res.body
            Requests.verifyAttributes("institucion cyt", institucion_CYT, InstCytAttributes)
        })

        it('Should get one institution (a new admin cyt)', async() => {
            const res = await Requests.GET(`/api/instituciones_cyt/${newInstitutionId}`, header_newAdmin, 200)
            const { institucion_CYT } = res.body
            Requests.verifyAttributes("institucion cyt", institucion_CYT, InstCytAttributes)
        })

        it('Should get one institution (admin general)', async() => {
            const id_inst = 1
            const res = await Requests.GET(`/api/instituciones_cyt/${id_inst}`, header_admin_general, 200)
            const { institucion_CYT } = res.body
            Requests.verifyAttributes("institucion cyt", institucion_CYT, InstCytAttributes)
        })

        it('Should get one institution (evaluador)', async() => {
            const id_inst = 1
            const res =  await Requests.GET(`/api/instituciones_cyt/${id_inst}`, header_evaluador_1, 200)
            const { institucion_CYT } = res.body
            Requests.verifyAttributes("institucion cyt", institucion_CYT, InstCytAttributes)
        })

        it('Should not find the institution (status 404)', async() => {
            const id_inst = 15000
            await Requests.GET(`/api/instituciones_cyt/${id_inst}`, header_admin_general, 404)
        })

        it('Should be a bad request (status 400)', async() => {
            const id_inst = 'a'
            await Requests.GET(`/api/instituciones_cyt/${id_inst}`, header_admin_general, 400)
        })

    })

    describe('POST /api/instituciones_cyt/:id_institucion/usuarios ==> Create a new evaluator user', async() => {
        
        it('Should create a new user (new admin)', async() => {
            newUser.user.dni = (Math.floor(Math.random() * 1000000) + 1).toString();
            newUser.user.institucion_origen = newInstCYT.institucion.nombre

            const caracteres = 'abcdefghijklmnopqrstuvwxyz0123456789'
            let correo = ''
            for (let i = 0; i < 10; i++) { correo += caracteres.charAt(Math.floor(Math.random() * caracteres.length)) }
            correo += '@example.com'
  
            newUser.user.email = correo

            newEvaluatorCredentials = {
                email: correo,
                password: newUser.user.dni
            }
            const res = await Requests.POST(`/api/instituciones_cyt/${newInstitutionId}/usuarios`, header_newAdmin, 200, newUser)
            
            Requests.verifyAttributes("new user", res.body.usuario, UserAttributes)
            newEvaluadorId = res.body.usuario.id
            const res2 = await Requests.POST('/api/login', null, 200, newEvaluatorCredentials)
            const { token } = res2.body
            header_newEvaluador = { 'Authorization': `Bearer ${token}` }
        })

        it('Should be unauthorized (admin general) (status 403)', async() => {
            await Requests.POST(`/api/instituciones_cyt/${newInstitutionId}/usuarios`, header_admin_general, 403, newUser.user)
        })

        it('Should be unauthorized (evaluador) (status 403)', async() => {
            await Requests.POST(`/api/instituciones_cyt/${newInstitutionId}/usuarios`, header_evaluador_1, 403, newUser.user)
        })

        it('Should be prohibited for an administrator to create a user to a foreign institution (admin cyt) (status 403)', async() => {
            await Requests.POST(`/api/instituciones_cyt/1/usuarios`, header_newAdmin, 403, newUser)
        })

        it('Should be a bad request (missing user fields) (status 400)', async() => {
            let dni = newUser.user.dni
            delete newUser.user.dni
            await Requests.POST(`/api/instituciones_cyt/${newInstitutionId}/usuarios`, header_newAdmin, 400, newUser)
            newUser.user.dni = dni
        })

        it('Should be a bad request (institution id should be a number) (status 400)', async() => {
            await Requests.POST(`/api/instituciones_cyt/a/usuarios`, header_newAdmin, 400, newUser)
        })

    })
    
    describe('POST /api/instituciones_cyt/:id_institucion/usuarios/vincular_usuario ==> Link an evaluator to the institution', async() => {
        
        it('Should link a user to the institution (admin cyt)', async() => {
            const res = await Requests.POST(`/api/instituciones_cyt/${newInstitutionId}/usuarios/vincular_usuario`, header_newAdmin, 200, {"dni": "123456789"})
            Requests.verifyAttributes("linked user", res.body.usuario, UserAttributes)
        })

        it('Should link a user to the institution (admin general)', async() => {
            const res = await Requests.POST(`/api/instituciones_cyt/${newInstitutionId}/usuarios/vincular_usuario`, header_admin_general, 200, {"dni": "987654321"})
            Requests.verifyAttributes("linked user", res.body.usuario, UserAttributes)
        })

        it('Should be prohibited for an administrator to link a user to a foreign institution (admin cyt) (status 403)', async() => {
            await Requests.POST(`/api/instituciones_cyt/${newInstitutionId}/usuarios/vincular_usuario`, header_admincyt_1, 403, {"dni": "123456789"})
        })

        it('Should not find the user (admin cyt) (status 404)', async() => {
            await Requests.POST(`/api/instituciones_cyt/${newInstitutionId}/usuarios/vincular_usuario`, header_newAdmin, 404, {"dni": "7777"})
        })

        it('Should be a bad request (dni should be a number) (admin cyt) (status 400)', async() => {
            await Requests.POST(`/api/instituciones_cyt/${newInstitutionId}/usuarios/vincular_usuario`, header_newAdmin, 400, {})
        })

    })

    describe('GET /api/instituciones_cyt/:id_institucion/usuarios ==> Get all users linked to the institution', async() => {
        
        it('Should gell all users linked to the new institution (admin cyt)', async() => {
            const res = await Requests.GET(`/api/instituciones_cyt/${newInstitutionId}/usuarios`, header_newAdmin, 200)
            const { users } = res.body
            assert.equal(users.length, 3), 'Should have 3 users associated with the institution'
            assert.equal((users.filter(user => user.dni === 123456789)).length, 1, 'Should have the user with ID 123456789 associated with the institution' )
            assert.equal((users.filter(user => user.dni === 987654321)).length, 1, 'Should have the user with ID 987654321 associated with the institution' )
        })

        it('Should gell all users linked to the new institution (admin general)', async() => {
            const res = await Requests.GET(`/api/instituciones_cyt/${newInstitutionId}/usuarios`, header_admin_general, 200)
            const { users } = res.body
            assert.equal(users.length, 3), 'Should have 2 users associated with the institution'
            assert.equal((users.filter(user => user.dni === 123456789)).length, 1, 'Should have the user with ID 123456789 associated with the institution' )
            assert.equal((users.filter(user => user.dni === 987654321)).length, 1, 'Should have the user with ID 987654321 associated with the institution' )
        })

        it('Should not be authorized (evaluador) (status 403)', async() => {
            await Requests.GET(`/api/instituciones_cyt/${newInstitutionId}/usuarios`, header_evaluador_1, 403)
        })

        it('Should not find the institution (admin cyt) (status 404)', async() => {
            await Requests.GET(`/api/instituciones_cyt/99999999/usuarios`, header_admin_general, 404)
        })

        it('Should be forbidden to get other institution users (admin cyt) (status 403)', async() => {
            await Requests.GET(`/api/instituciones_cyt/99999999/usuarios`, header_newAdmin, 403)
        })

    })

    describe('POST /api/instituciones_cyt/:id_institucion/proyectos ==> Create a new project', async() => {

        it('Should create a new Project (new admin)', async() => {
            newProject.id_director = newEvaluadorId
            pathInforme = newProject.pathInforme
            delete newProject.pathInforme
            const res = await Requests.POSTFormData(
                `/api/instituciones_cyt/${newInstitutionId}/proyectos`, 
                header_newAdmin, 
                200, 
                pathInforme,
                newProject,
                'proyecto')
            
            const proyecto = res.body
            Requests.verifyAttributes("new project", proyecto, ProjectAttributes)
            newProjectId = proyecto.id
            assert.equal(newEvaluadorId, proyecto.id_director, 'The director id should be the same as that of the new evaluator')
        })

        it('Should be unauthorized (admin general) (status 403)', async() => {
            await Requests.POSTFormData(
                `/api/instituciones_cyt/${newInstitutionId}/proyectos`, 
                header_admin_general, 
                403, 
                pathInforme,
                newProject,
                'proyecto')
        })

        it('Should be unauthorized (admin cyt 1) (status 403)', async() => {
            await Requests.POSTFormData(
                `/api/instituciones_cyt/${newInstitutionId}/proyectos`, 
                header_admincyt_1, 
                403, 
                pathInforme,
                newProject,
                'proyecto')
        })

        it('Should be unauthorized (evaluador) (status 403)', async() => {
            await Requests.POSTFormData(
                `/api/instituciones_cyt/${newInstitutionId}/proyectos`, 
                header_evaluador_1, 
                403, 
                pathInforme,
                newProject,
                'proyecto')
        })

        it('Should not let to create the same prohect again (new admin) (status 409)', async() => {
            await Requests.POSTFormData(
                `/api/instituciones_cyt/${newInstitutionId}/proyectos`, 
                header_newAdmin, 
                409, 
                pathInforme,
                newProject,
                'proyecto')
        })

    })
    
    describe('POST /api/instituciones_cyt/:id_institucion/proyectos/:id_proyecto/evaluadores ==> Assign a evaluator to the project', async() => {
        
        const data = {
            "id_evaluador": 1
        }

        it('Should assign 2 evaluators to the new project', async() => {
            const res1 = await Requests.POST(`/api/instituciones_cyt/${newInstitutionId}/proyectos/${newProjectId}/evaluadores`, header_newAdmin, 201, data)
            Requests.verifyAttributes("linked user", res1.body, linkedUserToProjectAtt)
            data.id_evaluador = 2
            const res2 = await Requests.POST(`/api/instituciones_cyt/${newInstitutionId}/proyectos/${newProjectId}/evaluadores`, header_newAdmin, 201, data)
            Requests.verifyAttributes("linked user", res2.body, linkedUserToProjectAtt)
        })

        it('Sould fail, the user is already linked to the institution', async() => {
            await Requests.POST(`/api/instituciones_cyt/${newInstitutionId}/proyectos/${newProjectId}/evaluadores`, header_newAdmin, 409, data)
        })

        it('Should not let assign the user to the project (the institution does not own the project) (status 403)', async() => {
            await Requests.POST(`/api/instituciones_cyt/${newInstitutionId}/proyectos/1/evaluadores`, header_newAdmin, 403, data)
        })

        it('Should not let assign the user to the project (the user its not linked to the institution) (status 409)', async() => {
            data.id_evaluador = 3
            await Requests.POST(`/api/instituciones_cyt/${newInstitutionId}/proyectos/${newProjectId}/evaluadores`, header_newAdmin, 409, data)
        })

        it('Should be a bad request (project id must me a number) (status 400)', async() => {
            await Requests.POST(`/api/instituciones_cyt/${newInstitutionId}/proyectos/a/evaluadores`, header_newAdmin, 400, data)
        })

    })

    describe('GET /api/instituciones_cyt/:id_institucion/proyectos/:id_proyecto/evaluadores ==> Gell all project evaluators', async() => {

        it('Should get all new project evaluators (new admin)', async() => {
            const res = await Requests.GET(`/api/instituciones_cyt/${newInstitutionId}/proyectos/${newProjectId}/evaluadores`, header_newAdmin, 200)
            const { participantes } = res.body
            participantes.forEach( (p) => {
                Requests.verifyAttributes("evaluadores", p, projectEvaluatorsAtt)
            })
        })

        it('Should be a bad request (institution id should be a number) (status 400)', async() => {
            await Requests.GET(`/api/instituciones_cyt/a/proyectos/${newProjectId}/evaluadores`, header_newAdmin, 400)
        })

        it('Should be a bad request (project id should be a number) (status 400)', async() => {
            await Requests.GET(`/api/instituciones_cyt/${newInstitutionId}/proyectos/a/evaluadores`, header_newAdmin, 400)
        })

        it('Should not find the institution (status 404)', async() => {
            await Requests.GET(`/api/instituciones_cyt/999999/proyectos/${newProjectId}/evaluadores`, header_newAdmin, 404)
        })
    })
   
    describe('DELETE /api/instituciones_cyt/:id_institucion/proyectos/:id_proyecto/evaluadores/:id_evaluador ==> Unassign a evaluator from a project', async() => {
        
        it('Should unnassign a evaluator', async() => {
            const res = await Requests.GET(`/api/instituciones_cyt/${newInstitutionId}/proyectos/${newProjectId}/evaluadores`, header_newAdmin, 200)
            await Requests.DELETE(`/api/instituciones_cyt/${newInstitutionId}/proyectos/${newProjectId}/evaluadores/2`, header_newAdmin, 204)
            const res2 = await Requests.GET(`/api/instituciones_cyt/${newInstitutionId}/proyectos/${newProjectId}/evaluadores`, header_newAdmin, 200)
            
            const { participantes: prev } = res.body
            const { participantes: post } = res2.body

            assert.ok( prev.filter(p => p.id == 2).length ===  1, "The evaluator with id = 2 should be assigned to the project")
            assert.ok( post.filter(p => p.id == 2).length ===  0, "The evaluator with id = 2 should not remain assigned to the project")
        })

        it('Should not let to unnassign evaluators from a project that belongs to other institution (status 403)', async() => {
            await Requests.DELETE(`/api/instituciones_cyt/1/proyectos/1/evaluadores/1`, header_newAdmin, 403)
        })

        it('Should not let to unnassign the director from his/her project (status 409)', async() => {
            await Requests.DELETE(`/api/instituciones_cyt/${newInstitutionId}/proyectos/${newProjectId}/evaluadores/${newEvaluadorId}`, header_newAdmin, 409)
        })

        it('Should not allow an evaluator who is not linked to the project to leave. (status 409)', async() => {
            await Requests.DELETE(`/api/instituciones_cyt/${newInstitutionId}/proyectos/${newProjectId}/evaluadores/2`, header_newAdmin, 404)
        })
    })

    describe('GET /api/instituciones_cyt/:id_institucion/proyectos ==> Get all institution projects', async() => {
        
        it('Should get all institution projects', async() => {
            const res = await Requests.GET(`/api/instituciones_cyt/${newInstitutionId}/proyectos`, header_newAdmin, 200)
            const { proyectos } = res.body
            proyectos.forEach(proyecto => {
                Requests.verifyAttributes("proyecto", proyecto, ProjectAttributes)
            })
        })

        it('Should not be authorized (evaluador) (403)', async() => {
            await Requests.GET(`/api/instituciones_cyt/${newInstitutionId}/proyectos`, header_newEvaluador, 403)
        })

    })

    describe('GET /api/instituciones_cyt/:id_institucion/proyectos/:id_proyecto ==> Get one institution project', async() => {
        
        it('Should get one project', async() => {
            const res = await Requests.GET(`/api/instituciones_cyt/${newInstitutionId}/proyectos/${newProjectId}`, header_newAdmin, 200)
            const proyecto = res.body
            Requests.verifyAttributes("proyecto", proyecto, ProjectAttributes)
        })
        
        it('Should not find the institution (status 403)', async() => {
            await Requests.GET(`/api/instituciones_cyt/999999/proyectos/${newProjectId}`, header_newAdmin, 403)
        })
        
        it('Should not find the project (the institution does not own the specified project) (status 403)', async() => {
            await Requests.GET(`/api/instituciones_cyt/${newInstitutionId}/proyectos/1`, header_newAdmin, 403)
        })

    })
    
})

module.exports = {
    getNewAdminHeader,
    getNetEvaluadorHeader,
    getNewInstitutionId,
    getNewProjectId,
    getNewEvaluatorCredentials,
    getNewEvaluatorId
}