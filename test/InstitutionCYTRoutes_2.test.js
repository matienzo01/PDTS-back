

const Requests = require('./Requests.js')
const getHeaders = require('./LoginRoutes.test.js')
const assert = require('assert');
const newInstData = require('./InstitutionCYTRoutes_1.test.js')

describe('TEST INSTITUTION (CYT) ROUTES - PART 2', () => {

    
    describe('DELETE /api/instituciones_cyt/:id_institucion/proyectos/:id_proyecto ==> Delete one project', async() => {
        
        
    })

    describe('DELETE /api/instituciones_cyt/:id_institucion ==> Delete one institution', async() => {
        
        it('Should delete one institution (admin general)', async() => {
            const { header_admin_general } = getHeaders()
            await Requests.DELETE(`/api/instituciones_cyt/${newInstData.getNewInstitutionId()}`, header_admin_general, 204)
        })

        it('Should not be authorized (admin cyt)', async() => {
            const { header_admincyt_1 } = getHeaders()
            await Requests.DELETE(`/api/instituciones_cyt/1`, header_admincyt_1, 403)
        })
        
        it('Should not be authorized (evaluador)', async() => {
            const { header_evaluador_1 } = getHeaders()
            await Requests.DELETE(`/api/instituciones_cyt/1}`, header_evaluador_1, 403)
        })
    })

})