const request = require('supertest');
const server = require('../src/app'); // Importa tu aplicación Express aquí
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
    return res.body.institucion;
  }

  async function getAllInstitutions(header, statusCode) {
    const res = await request(server)
      .get('/api/instituciones')
      .set(header)
      .expect(statusCode);
    return res.body.instituciones;
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
        const { header_admincyt } = getHeaders();
        
        const instituciones = await getAllInstitutions(header_admincyt, 200)
        instituciones.forEach(inst => {
          const actualAttributes = Object.keys(inst);
          const unexpectedAttributes = actualAttributes.filter(attr => !expectedAttributes.includes(attr));
          assert.equal(unexpectedAttributes.length, 0, `User object has unexpected attributes: ${unexpectedAttributes.join(', ')}`);
        });  
    });

    it('Should be unauthorized for evaluadores ', async() => {
        const { header_evaluador } = getHeaders();
        await getAllInstitutions(header_evaluador, 403)  
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
        const { header_admincyt } = getHeaders();
        
        const actualAttributes = Object.keys(await getOneInstitutions(header_admincyt, 1, 200));
        const unexpectedAttributes = actualAttributes.filter(attr => !expectedAttributes.includes(attr));
        assert.equal(unexpectedAttributes.length, 0, `User object has unexpected attributes: ${unexpectedAttributes.join(', ')}`); 
    });

    it('Should be unauthorized for evaluadores ', async() => {
        const { header_evaluador } = getHeaders();
        await getOneInstitutions(header_evaluador, 1, 403)
    });

    it('Should be a bad request (id_inst should be a number) ', async() => {
        const { header_admincyt } = getHeaders();
        await getOneInstitutions(header_admincyt, 'a', 400)
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
        const { header_admincyt } = getHeaders();
        const res = await request(server)
          .post('/api/instituciones')
          .send(newInst)
          .set(header_admincyt)
          .expect(200);
        const { institucion } = res.body
        await getOneInstitutions(header_admincyt,institucion.id,200)
    })

    it('Should create a new institution (admin general)', async() => {
        const { header_admin_general } = getHeaders();
        const res = await request(server)
          .post('/api/instituciones')
          .send(newInst)
          .set(header_admin_general)
          .expect(200);
        const { institucion } = res.body
        await getOneInstitutions(header_admin_general,institucion.id,200)
    })

    it('Should be unauthorized for evaluadores', async() => {
        const { header_evaluador } = getHeaders();
        await request(server)
          .post('/api/instituciones')
          .send(newInst)
          .set(header_evaluador)
          .expect(403);
    })

    it('Should fail creating a institution (missing fields)', async() => {
        const { header_admincyt } = getHeaders();
        delete newInst.institucion.nombre
        await request(server)
          .post('/api/instituciones')
          .send(newInst)
          .set(header_admincyt)
          .expect(400);
    })

  })

})