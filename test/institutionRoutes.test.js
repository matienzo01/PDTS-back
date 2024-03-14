const getHeaders = require('./LoginRoutes.test')
const Requests = require('./Requests.js')
const assert = require('assert');

const newInst = require('./jsons/newInst.json')
const { expectedAttributes } = require('./jsons/InstAttributes.json')

describe('TEST INSTITUTION ROUTES', () => {

  describe('GET /api/instituciones ==> Get all institutions', async() => {

    it('Should return all institutions (admin general)', async() => {
        const { header_admin_general } = getHeaders();
        
        const instituciones = await Requests.getAllInstitutions(header_admin_general, 200)
        instituciones.forEach(inst => {
          Requests.verifyAttributes(inst, expectedAttributes)
        });  
    });

    it('Should return all institutions (admin cyt)', async() => {
        const { header_admincyt_1 } = getHeaders();
        
        const instituciones = await Requests.getAllInstitutions(header_admincyt_1, 200)
        instituciones.forEach(inst => {
          Requests.verifyAttributes(inst, expectedAttributes)
        });  
    });

    it('Should be unauthorized for evaluadores (status 403)', async() => {
        const { header_evaluador_1 } = getHeaders();
        await Requests.getAllInstitutions(header_evaluador_1, 403)  
    });

  })

  describe('GET /api/instituciones/:inst_id ==> Get one institution', async() => {

    it('Should return one institution (admin general)', async() => {
        const { header_admin_general } = getHeaders();
        Requests.verifyAttributes(await Requests.getOneInstitutions(header_admin_general, 1, 200), expectedAttributes)
    });

    it('Should return one institution (admin cyt)', async() => {
        const { header_admincyt_1 } = getHeaders();
        Requests.verifyAttributes(await Requests.getOneInstitutions(header_admincyt_1, 1, 200), expectedAttributes)
    });

    it('Should be unauthorized for evaluadores (status 403)', async() => {
        const { header_evaluador_1 } = getHeaders();
        await Requests.getOneInstitutions(header_evaluador_1, 1, 403)
    });

    it('Should be a bad request (id_inst should be a number) (status 400)', async() => {
        const { header_admincyt_1 } = getHeaders();
        await Requests.getOneInstitutions(header_admincyt_1, 'a', 400)
    });

  })

  describe('POST /api/instituciones ==> Post institution', async() => {

    it('Should create a new institution (admincyt)', async() => {
        const { header_admincyt_1 } = getHeaders();
        const { institucion } = await Requests.createInstitution(header_admincyt_1, newInst, 200)
        
        Requests.verifyAttributes(await Requests.getOneInstitutions(header_admincyt_1,institucion.id,200), expectedAttributes)
        
    })

    it('Should create a new institution (admin general)', async() => {
        const { header_admin_general } = getHeaders();
        const { institucion } = await Requests.createInstitution(header_admin_general, newInst, 200)
        Requests.verifyAttributes(await Requests.getOneInstitutions(header_admin_general,institucion.id,200), expectedAttributes)
        
    })

    it('Should be unauthorized for evaluadores (status 403)', async() => {
        const { header_evaluador_1 } = getHeaders();
        await Requests.createInstitution(header_evaluador_1, newInst, 403)
    })

    it('Should fail creating a institution (missing fields) (status 400)', async() => {
        const { header_admincyt_1 } = getHeaders();
        delete newInst.institucion.nombre
        await Requests.createInstitution(header_admincyt_1, newInst, 400)
    })

  })

})