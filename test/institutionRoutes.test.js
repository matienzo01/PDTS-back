const getHeaders = require('./LoginRoutes.test.js')
const Requests = require('./Requests.js')
const assert = require('assert');

const newInst = require('./jsons/newInst.json')
const { expectedAttributes } = require('./jsons/InstAttributes.json')

describe('TEST INSTITUTION ROUTES', () => {

  describe('GET /api/instituciones ==> Get all institutions', async() => {

    it('Should return all institutions (admin general)', async() => {
        const { header_admin_general } = getHeaders();
        const res = await Requests.GET('/api/instituciones', header_admin_general, 200)
        const { instituciones } = res.body
        instituciones.forEach(inst => {
          Requests.verifyAttributes(inst, expectedAttributes)
        });  
    });

    it('Should return all institutions (admin cyt)', async() => {
        const { header_admincyt_1 } = getHeaders();
        
        const res = await Requests.GET('/api/instituciones', header_admincyt_1, 200)
        const { instituciones } = res.body
        instituciones.forEach(inst => {
          Requests.verifyAttributes(inst, expectedAttributes)
        });  
    });

    it('Should be unauthorized for evaluadores (status 403)', async() => {
        const { header_evaluador_1 } = getHeaders();
        await Requests.GET('/api/instituciones', header_evaluador_1, 403) 
    });

  })

  describe('GET /api/instituciones/:inst_id ==> Get one institution', async() => {

    it('Should return one institution (admin general)', async() => {
        const { header_admin_general } = getHeaders();
        const inst_id = 1
        const res = await Requests.GET(`/api/instituciones/${inst_id}`, header_admin_general, 200)
        const { institucion } = res.body
        Requests.verifyAttributes(institucion, expectedAttributes)
    });

    it('Should return one institution (admin cyt)', async() => {
        const { header_admincyt_1 } = getHeaders();
        const inst_id = 1
        const res = await Requests.GET(`/api/instituciones/${inst_id}`, header_admincyt_1, 200)
        const { institucion } = res.body
        Requests.verifyAttributes(institucion, expectedAttributes)
    });

    it('Should be unauthorized for evaluadores (status 403)', async() => {
        const { header_evaluador_1 } = getHeaders();
        const inst_id = 1
        await Requests.GET(`/api/instituciones/${inst_id}`, header_evaluador_1, 403)
    });

    it('Should be a bad request (id_inst should be a number) (status 400)', async() => {
        const { header_admincyt_1 } = getHeaders();
        const inst_id = 'a'
        await Requests.GET(`/api/instituciones/${inst_id}`, header_admincyt_1, 400)
    });

  })

  describe('POST /api/instituciones ==> Post institution', async() => {

    it('Should create a new institution (admincyt)', async() => {
        const { header_admincyt_1 } = getHeaders();
        const res = await Requests.POST('/api/instituciones', header_admincyt_1, 200, newInst)
        const { institucion } = res.body
        Requests.verifyAttributes(institucion, expectedAttributes)
    })

    it('Should create a new institution (admin general)', async() => {
        const { header_admin_general } = getHeaders();
        const res = await Requests.POST('/api/instituciones', header_admin_general, 200, newInst)
        const { institucion } = res.body
        Requests.verifyAttributes(institucion, expectedAttributes)
        
    })

    it('Should be unauthorized for evaluadores (status 403)', async() => {
        const { header_evaluador_1 } = getHeaders();
        await Requests.POST('/api/instituciones', header_evaluador_1, 403, newInst)
    })

    it('Should fail creating a institution (missing fields) (status 400)', async() => {
        const { header_admincyt_1 } = getHeaders();
        delete newInst.institucion.nombre
        await Requests.POST('/api/instituciones', header_admincyt_1, 400, newInst)
    })

  })

})