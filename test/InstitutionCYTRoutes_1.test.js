const Requests = require('./Requests.js')
const getHeaders = require('./LoginRoutes.test.js')
const assert = require('assert');

const { expectedAttributes: InstCytAttributes } = require('./jsons/InstCYTAttributes.json')
const { expectedAttributes: UserAttributes } = require('./jsons/userAttributes2.json')
const newInstCYT = require('./jsons/newInstCYT.json')
const newUser = require('./jsons/newUsers.json');
let header_newAdmin
let newInstitutionId 

const getNewHeader = () => { return header_newAdmin }
const getNewInstitutionId = () => { return newInstitutionId }

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
                Requests.verifyAttributes(inst, InstCytAttributes)
            });
        })

        it('Should get all institutions (admin general)', async() => {
            const res = await Requests.GET('/api/instituciones_cyt', header_admin_general, 200)
            const { instituciones_CYT } = res.body
            instituciones_CYT.forEach(inst => {
                Requests.verifyAttributes(inst, InstCytAttributes)
            });
        })

        it('Should be unauthorized (evaluador) (status 403)', async() => {
            await Requests.GET('/api/instituciones_cyt', header_evaluador_1, 403)
        })

    })

    describe('GET /api/instituciones_cyt/tipos ==> Get all institution types', async() => {
        
        it('Should get all institutions (admin cyt)', async() => {
            const res = await Requests.GET('/api/instituciones_cyt/tipos', header_admincyt_1, 200)
            const { tipos } = res.body
            tipos.forEach(tipo => {
                Requests.verifyAttributes(tipo, ['id', 'tipo'])
            });
        })

        it('Should get all institutions (admin general)', async() => {
            const res = await Requests.GET('/api/instituciones_cyt/tipos', header_admin_general, 200)
            const { tipos } = res.body
            tipos.forEach(tipo => {
                Requests.verifyAttributes(tipo, ['id', 'tipo'])
            });
        })

        it('Should be unauthorized (evaluador) (status 403)', async() => {
            const res = await Requests.GET('/api/instituciones_cyt/tipos', header_evaluador_1, 403)
        })

    })

    describe('POST /api/instituciones_cyt ==> Create a new institution', async() => {

        it('Should create a new institution (admin general)', async() => {
            const res = await Requests.POST('/api/instituciones_cyt', header_admin_general, 200, newInstCYT)
            const { institucion_CYT } = res.body
            newInstitutionId = institucion_CYT.id
            Requests.verifyAttributes(institucion_CYT, InstCytAttributes)

            const credentials = {
                "mail": newInstCYT.admin.email,
                "password": newInstCYT.admin.password
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
        
        it('Should get all institutions (admin cyt)', async() => {
            const id_inst = 1
            const res = await Requests.GET(`/api/instituciones_cyt/${id_inst}`, header_admincyt_1, 200)
            const { institucion_CYT } = res.body
            Requests.verifyAttributes(institucion_CYT, InstCytAttributes)
        })

        it('Should get all institutions (a new admin cyt)', async() => {
            const res = await Requests.GET(`/api/instituciones_cyt/${newInstitutionId}`, header_newAdmin, 200)
            const { institucion_CYT } = res.body
            Requests.verifyAttributes(institucion_CYT, InstCytAttributes)
        })

        it('Should get all institutions (admin general)', async() => {
            const id_inst = 1
            const res = await Requests.GET(`/api/instituciones_cyt/${id_inst}`, header_admin_general, 200)
            const { institucion_CYT } = res.body
            Requests.verifyAttributes(institucion_CYT, InstCytAttributes)
        })

        it('Should be unauthorized (evaluador) (status 403)', async() => {
            const id_inst = 1
            await Requests.GET(`/api/instituciones_cyt/${id_inst}`, header_evaluador_1, 403)
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
            newUser.user.dni = Math.floor(Math.random() * 1000000) + 1;
            newUser.user.institucion_origen = newInstCYT.institucion.nombre
            const res = await Requests.POST(`/api/instituciones_cyt/${newInstitutionId}/usuarios`, header_newAdmin, 200, newUser)
            Requests.verifyAttributes(res.body.usuario, UserAttributes)
        })

        it('Should be unauthorized (admin general) (status 403)', async() => {
            await Requests.POST(`/api/instituciones_cyt/${newInstitutionId}/usuarios`, header_evaluador_1, 403, newUser.user)
        })

        it('Should be unauthorized (evaluador) (status 403)', async() => {
            await Requests.POST(`/api/instituciones_cyt/${newInstitutionId}/usuarios`, header_evaluador_1, 403, newUser.user)
        })

        it('Should not find the institution (status 404)', async() => {
            await Requests.POST(`/api/instituciones_cyt/${newInstitutionId*150}/usuarios`, header_newAdmin, 404, newUser)
        })

        it('Should be a bad request (missing user fields) (status 400)', async() => {
            let dni = newUser.user.dni
            delete newUser.user.dni
            await Requests.POST(`/api/instituciones_cyt/${newInstitutionId}/usuarios`, header_newAdmin, 400, newUser)
            newUser.user.dni = dni
        })

        it('Should be a bad request (missing user fields) (status 400)', async() => {
            await Requests.POST(`/api/instituciones_cyt/a/usuarios`, header_newAdmin, 400, newUser)
        })

    })

    describe('POST /api/instituciones_cyt/:id_institucion/usuarios/vincular_usuario ==> Link an evaluator to the institution', async() => {
        
        it('Should link a user to the institution. (admin cyt)', async() => {
            const res = await Requests.POST(`/api/instituciones_cyt/${newInstitutionId}/usuarios/vincular_usuario`, header_newAdmin, 200, {"dni": "123456789"})
            Requests.verifyAttributes(res.body.usuario, UserAttributes)
        })

        it('Should link a user to the institution. (admin general)', async() => {
            const res = await Requests.POST(`/api/instituciones_cyt/${newInstitutionId}/usuarios/vincular_usuario`, header_admin_general, 200, {"dni": "987654321"})
            Requests.verifyAttributes(res.body.usuario, UserAttributes)
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

})

module.exports = {
    getNewHeader,
    getNewInstitutionId
}