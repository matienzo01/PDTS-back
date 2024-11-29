const Requests = require('./Requests.js')
const getHeaders = require('./LoginRoutes.test.js')
const assert = require('assert');
const newNormalInstData = require('./InstitutionRoutes_1.test.js')

describe('TEST INSTITUTION ROUTES - PART 2', () => {

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
    
    describe('DELETE /api/instituciones/rubros/:id_rubro ==> Delete one rubro', async() => {

        it('Should have conflict deleting the rubro (an institution has the rubro assigned)', async() => {
            await Requests.DELETE(`/api/instituciones/rubros/${newNormalInstData.getNewRubro1Id()}`,
                header_admin_general, 409)
        })

    })

    describe('DELETE /api/instituciones/:id_inst ==> Delete one institution', async() => {

        it('Should delete one rubro (admin general)', async() => {
            await Requests.DELETE(`/api/instituciones/${newNormalInstData.getNewInst1Id()}`,
                header_admin_general, 200)
        })

        it('Should delete one rubro (admin cyt)', async() => {
            await Requests.DELETE(`/api/instituciones/${newNormalInstData.getNewInst2Id()}`,
                header_admincyt_1, 200)
        })

    })

    describe('DELETE /api/instituciones/rubros/:id_rubro ==> Delete one rubro', async() => {

        it('Should delete one rubro (admin general)', async() => {
            await Requests.DELETE(`/api/instituciones/rubros/${newNormalInstData.getNewRubro1Id()}`,
                header_admin_general, 200)
        })

        it('Should delete one rubro (admin cyt)', async() => {
            await Requests.DELETE(`/api/instituciones/rubros/${newNormalInstData.getNewRubro2Id()}`,
                header_admincyt_1, 200)
        })

    })

    

})