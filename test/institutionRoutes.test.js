const request = require('supertest');
const server = require('../src/app');
const getHeaders = require('./LoginRoutes.test')
const assert = require('assert');


describe('TEST INSTITUTION ROUTES', () => {
  
  const expectedAttributes = [
    'id', 'nombre', 'rubro', 'pais', 'provincia',
    'localidad', 'telefono_institucional', 'mail_institucional', 'esCyT'
  ]

  async function getOneInstitutions(header, id_inst, statusCode) {
    const res = await request(server)
      .get(`/api/instituciones/${id_inst}`)
      .set(header)
      .expect(statusCode);
    
    assert.equal(res.type, 'application/json')
    return res.body.institucion;
  }

  async function getAllInstitutions(header, statusCode) {
    const res = await request(server)
      .get('/api/instituciones')
      .set(header)
      .expect(statusCode);
    
    assert.equal(res.type, 'application/json')
    return res.body.instituciones;
  }

  async function createInstitution(header, newInst, statusCode) {
    const res = await request(server)
      .post('/api/instituciones')
      .send(newInst)
      .set(header)
      .expect(statusCode)
    
    assert.equal(res.type, 'application/json')
    return res.body
  }

  describe('GET /api/instituciones ==> Get all institutions', async() => {

    it('Should return all institutions (admin general)', async() => {
        const { header_admin_general } = getHeaders();
        
        const instituciones = await getAllInstitutions(header_admin_general, 200)
        instituciones.forEach(inst => {
          const actualAttributes = Object.keys(inst);
          const unexpectedAttributes = actualAttributes.filter(attr => !expectedAttributes.includes(attr));
          assert.equal(unexpectedAttributes.length, 0, `User object has unexpected attributes: ${unexpectedAttributes.join(', ')}`);
        });  
    });

    it('Should return all institutions (admin cyt)', async() => {
        const { header_admincyt_1 } = getHeaders();
        
        const instituciones = await getAllInstitutions(header_admincyt_1, 200)
        instituciones.forEach(inst => {
          const actualAttributes = Object.keys(inst);
          const unexpectedAttributes = actualAttributes.filter(attr => !expectedAttributes.includes(attr));
          assert.equal(unexpectedAttributes.length, 0, `User object has unexpected attributes: ${unexpectedAttributes.join(', ')}`);
        });  
    });

    it('Should be unauthorized for evaluadores (status 403)', async() => {
        const { header_evaluador_1 } = getHeaders();
        await getAllInstitutions(header_evaluador_1, 403)  
    });

  })

  describe('GET /api/instituciones/:inst_id ==> Get one institution', async() => {

    it('Should return one institution (admin general)', async() => {
        const { header_admin_general } = getHeaders();
        
        const actualAttributes = Object.keys(await getOneInstitutions(header_admin_general, 1, 200));
        const unexpectedAttributes = actualAttributes.filter(attr => !expectedAttributes.includes(attr));
        assert.equal(unexpectedAttributes.length, 0, `User object has unexpected attributes: ${unexpectedAttributes.join(', ')}`); 
    });

    it('Should return one institution (admin cyt)', async() => {
        const { header_admincyt_1 } = getHeaders();
        
        const actualAttributes = Object.keys(await getOneInstitutions(header_admincyt_1, 1, 200));
        const unexpectedAttributes = actualAttributes.filter(attr => !expectedAttributes.includes(attr));
        assert.equal(unexpectedAttributes.length, 0, `User object has unexpected attributes: ${unexpectedAttributes.join(', ')}`); 
    });

    it('Should be unauthorized for evaluadores (status 403)', async() => {
        const { header_evaluador_1 } = getHeaders();
        await getOneInstitutions(header_evaluador_1, 1, 403)
    });

    it('Should be a bad request (id_inst should be a number) (status 400)', async() => {
        const { header_admincyt_1 } = getHeaders();
        await getOneInstitutions(header_admincyt_1, 'a', 400)
    });

  })

  describe('POST /api/instituciones ==> Post institution', async() => {

    const newInst = {
      "institucion": {
        "nombre": "INSTITUCION PARTICIPANTE DE PRUEBA",
        "rubro": "rubroA",
        "pais": "Argentina",
        "provincia": "Buenos Aires",
        "localidad": "Ciudad B",
        "telefono_institucional": "132456798",
        "mail_institucional": "info@utn.com"
      }
    }

    it('Should create a new institution (admincyt)', async() => {
        const { header_admincyt_1 } = getHeaders();
        const { institucion } = await createInstitution(header_admincyt_1, newInst, 200)
        await getOneInstitutions(header_admincyt_1,institucion.id,200)
    })

    it('Should create a new institution (admin general)', async() => {
        const { header_admin_general } = getHeaders();
        const { institucion } = await createInstitution(header_admin_general, newInst, 200)
        await getOneInstitutions(header_admin_general,institucion.id,200)
    })

    it('Should be unauthorized for evaluadores (status 403)', async() => {
        const { header_evaluador_1 } = getHeaders();
        await createInstitution(header_evaluador_1, newInst, 403)
    })

    it('Should fail creating a institution (missing fields) (status 400)', async() => {
        const { header_admincyt_1 } = getHeaders();
        delete newInst.institucion.nombre
        await createInstitution(header_admincyt_1, newInst, 400)
    })

  })

})