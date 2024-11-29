const getHeaders = require('./LoginRoutes.test.js')
const Requests = require('./Requests.js')
const assert = require('assert');

const newInst = require('./jsons/newData/newInst.json')
const { newRubro1, newRubro2 } = require('./jsons/newData/newRubros.json')
const { expectedAttributes } = require('./jsons/expectedAttributes/InstAttributes.json')
const { expectedAttributes: typesExpectedAttributes } = require('./jsons/expectedAttributes/insTypesAttributes.json')
const { expectedAttributes: rubrosExpectedAttributes } = require('./jsons/expectedAttributes/rubroAttributes.json')

let _newRubro1 
let _newRubro2
let _newInst1
let _newInst2

const getNewRubro1Id = () => { return _newRubro1.id }
const getNewRubro2Id = () => { return _newRubro2.id }
const getNewInst1Id = () => { return _newInst1.id }
const getNewInst2Id = () => { return _newInst2.id }

describe('TEST INSTITUTION ROUTES - PART 1', () => {

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

  describe('GET /api/instituciones ==> Get all institutions', async() => {

    it('Should return all institutions (admin general)', async() => {
        const res = await Requests.GET('/api/instituciones', header_admin_general, 200)
        const { instituciones } = res.body
        instituciones.forEach(inst => {
          Requests.verifyAttributes("institucion", inst, expectedAttributes)
        });  
    });

    it('Should return all institutions (admin cyt)', async() => {
        const res = await Requests.GET('/api/instituciones', header_admincyt_1, 200)
        const { instituciones } = res.body
        instituciones.forEach(inst => {
          Requests.verifyAttributes("institucion", inst, expectedAttributes)
        });  
    });

    it('Should be unauthorized for evaluadores (status 403)', async() => {
        await Requests.GET('/api/instituciones', header_evaluador_1, 403) 
    });

  })

  describe('GET /api/instituciones/:inst_id ==> Get one institution', async() => {

    it('Should return one institution (admin general)', async() => {
        const inst_id = 1
        const res = await Requests.GET(`/api/instituciones/${inst_id}`, header_admin_general, 200)
        const { institucion } = res.body
        Requests.verifyAttributes("institucion", institucion, expectedAttributes)
    });

    it('Should return one institution (admin cyt)', async() => {
        const inst_id = 1
        const res = await Requests.GET(`/api/instituciones/${inst_id}`, header_admincyt_1, 200)
        const { institucion } = res.body
        Requests.verifyAttributes("institucion", institucion, expectedAttributes)
    });

    it('Should be unauthorized for evaluadores (status 403)', async() => {
        const inst_id = 1
        await Requests.GET(`/api/instituciones/${inst_id}`, header_evaluador_1, 403)
    });

    it('Should be a bad request (id_inst should be a number) (status 400)', async() => {
        const inst_id = 'a'
        await Requests.GET(`/api/instituciones/${inst_id}`, header_admincyt_1, 400)
    });

  })

  describe('GET /api/instituciones/tipos ==> Get institutions types', async() => {

    it('Should return all institution types (admin general)', async() => {
        const res = await Requests.GET(`/api/instituciones/tipos`, header_admin_general, 200)
        const { tipos } = res.body
        tipos.forEach(t => Requests.verifyAttributes("tipo", t, typesExpectedAttributes))
    });

    it('Should return all institution types (admin cyt)', async() => {
      const res = await Requests.GET(`/api/instituciones/tipos`, header_admincyt_1, 200)
      const { tipos } = res.body
      tipos.forEach(t => Requests.verifyAttributes("tipo", t, typesExpectedAttributes))
    });

    it('Should be unauthorized for evaluadores (status 403)', async() => {
      await Requests.GET(`/api/instituciones/tipos`, header_evaluador_1, 403)
    });

  })

  describe('GET /api/instituciones/rubros ==> Get all rubros', async() => {

    it('Should return all institution rubros (admin general)', async() => {
        const res = await Requests.GET(`/api/instituciones/rubros`, header_admin_general, 200)
        const { rubros } = res.body
        rubros.forEach(r => Requests.verifyAttributes("rubro", r, rubrosExpectedAttributes))
    });

    it('Should return all institution rubros (admin cyt)', async() => {
      const res = await Requests.GET(`/api/instituciones/rubros`, header_admincyt_1, 200)
      const { rubros } = res.body
      rubros.forEach(r => Requests.verifyAttributes("rubro", r, rubrosExpectedAttributes))
    });

    it('Should be unauthorized for evaluadores (status 403)', async() => {
      await Requests.GET(`/api/instituciones/tipos`, header_evaluador_1, 403)
    });

  })

  describe('POST /api/instituciones ==> Post rubro', async() => {

    it('Should create a new rubro (admin general)', async() => {
      const res = await Requests.POST('/api/instituciones/rubros', header_admin_general, 200, newRubro1)
      const {rubro} = res.body
      Requests.verifyAttributes("rubro", rubro, rubrosExpectedAttributes)
      _newRubro1 = rubro

    })

    it('Should create a new rubro (admin cyt)', async() => {
      const res = await Requests.POST('/api/instituciones/rubros', header_admincyt_1, 200, newRubro2)
      const {rubro} = res.body
      Requests.verifyAttributes("rubro", rubro, rubrosExpectedAttributes)
      _newRubro2 = rubro
    })

    it('Should be unauthorized for evaluadores (status 403)', async() => {
      await Requests.POST('/api/instituciones/rubros', header_evaluador_1, 403, newRubro1)
    })

    it('Should fail creating a rubro (missing fields) (status 400)', async() => {
        await Requests.POST('/api/instituciones/rubros', header_admincyt_1, 400, {})
    })

  })

  describe('POST /api/instituciones ==> Post institution', async() => {

    it('Should create a new institution (admincyt)', async() => {
      newInst.institucion.id_rubro = _newRubro1.id
      const res = await Requests.POST('/api/instituciones', header_admincyt_1, 200, newInst)
      const { institucion } = res.body
      Requests.verifyAttributes("institucion", institucion, expectedAttributes)
      _newInst1 = institucion
    })

    it('Should create a new institution (admin general)', async() => {
      const res = await Requests.POST('/api/instituciones', header_admin_general, 200, newInst)
      const { institucion } = res.body
      Requests.verifyAttributes("institucion",institucion, expectedAttributes)  
      _newInst2 = institucion
    })

    it('Should be unauthorized for evaluadores (status 403)', async() => {
      await Requests.POST('/api/instituciones', header_evaluador_1, 403, newInst)
    })

    it('Should not found the institution type (status 403)', async() => {
      newInst.institucion.id_tipo = 900
      await Requests.POST('/api/instituciones', header_admin_general, 404, newInst)
    })

    it('Should fail creating a institution (missing fields) (status 400)', async() => {
      delete newInst.institucion.nombre
      await Requests.POST('/api/instituciones', header_admincyt_1, 400, newInst)
    })

  })

})

module.exports = {
  getNewRubro1Id,
  getNewRubro2Id,
  getNewInst1Id,
  getNewInst2Id
}