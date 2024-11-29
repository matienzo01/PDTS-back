const Requests = require('./Requests.js')
const getHeaders = require('./LoginRoutes.test.js')
const newInstData = require('./InstitutionCYTRoutes_1.test.js')

describe('TEST INSTITUTION (CYT) ROUTES - PART 2', () => {

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
    
    describe('DELETE /api/instituciones_cyt/:id_institucion ==> Delete one institution', async() => {
        
        it('Shouldnt let to delete one institution (it owns al least one project) (admin general) (status 403)', async() => {
            await Requests.DELETE(`/api/instituciones_cyt/${newInstData.getNewInstitutionId()}`, header_admin_general, 409)
        })
    })

    describe('DELETE /api/instituciones_cyt/:id_institucion/proyectos/:id_proyecto ==> Delete one project', async() => {
        
        it('Should delete one proect (new admin)', async() => {
            await Requests.DELETE(`/api/instituciones_cyt/${newInstData.getNewInstitutionId()}/proyectos/${newInstData.getNewProjectId()}`,
                newInstData.getNewAdminHeader(), 204)
        })

    })

    describe('DELETE /api/instituciones_cyt/:id_institucion ==> Delete one institution', async() => {
        
        it('Should delete one institution (admin general)', async() => {
            await Requests.DELETE(`/api/instituciones_cyt/${newInstData.getNewInstitutionId()}`, header_admin_general, 200)
        })

        it('Should not be authorized (admin cyt)', async() => {
            await Requests.DELETE(`/api/instituciones_cyt/1`, header_admincyt_1, 403)
        })
        
        it('Should not be authorized (evaluador)', async() => {
            await Requests.DELETE(`/api/instituciones_cyt/1}`, header_evaluador_1, 403)
        })
    })

})