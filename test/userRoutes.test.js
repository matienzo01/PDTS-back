const request = require('supertest');
const server = require('../src/app'); // Importa tu aplicación Express aquí
const getHeaders = require('./LoginRoutes.test')
const assert = require('assert');

describe('TEST USER ROUTES', () => {

  describe('GET /api/usuarios ==> Get all users', () => {

    const expectedAttributes = [
      'id', 'email', 'dni', 'nombre', 'apellido', 'celular', 'especialidad',
      'institucion_origen', 'pais_residencia', 'provincia_residencia',
      'localidad_residencia', 'participaEn'
    ];

    it('Should return all users', async() => {
      const { header_admin_general } = getHeaders();
      const res = await request(server)
        .get('/api/usuarios')
        .set(header_admin_general)
        .expect(200);
      
      const { usuarios } = res.body
      usuarios.forEach(user => {
        const actualAttributes = Object.keys(user);
        const unexpectedAttributes = actualAttributes.filter(attr => !expectedAttributes.includes(attr));
        assert.equal(unexpectedAttributes.length, 0, `User object has unexpected attributes: ${unexpectedAttributes.join(', ')}`);
      });    
    });

    it('Should be unauthorized for evaluators', async() => {
      const { header_evaluador } = getHeaders();
      await request(server)
        .get('/api/usuarios')
        .set(header_evaluador)
        .expect(403);
    });

    it('Should be unauthorized for adminscyt', async() => {
      const { header_admincyt } = getHeaders();
      await request(server)
        .get('/api/usuarios')
        .set(header_admincyt)
        .expect(403);
    });

  })

  describe('GET /api/usuarios/:dni ==> Get one user', () => { 
    
    const expectedAttributes = [
      'id', 'email', 'dni', 'nombre', 'apellido', 'celular', 'especialidad',
      'institucion_origen', 'pais_residencia', 'provincia_residencia',
      'localidad_residencia'
    ];

    it('Should return one user', async() => {
      const { header_evaluador } = getHeaders();
      const dni = 123456789
      const res = await request(server)
        .get(`/api/usuarios/${dni}`)
        .set(header_evaluador)
        .expect(200);

      const { usuario } = res.body
      const actualAttributes = Object.keys(usuario);
      const unexpectedAttributes = actualAttributes.filter(attr => !expectedAttributes.includes(attr));
      assert.equal(unexpectedAttributes.length, 0, `User object has unexpected attributes: ${unexpectedAttributes.join(', ')}`);
    });

    it('Should not found an user', async() => {
      const { header_evaluador } = getHeaders();
      const dni = 4
      const res = await request(server)
        .get(`/api/usuarios/${dni}`)
        .set(header_evaluador)
        .expect(404);

      assert.equal((Object.keys(res.body).filter(attr => !(['error'].includes(attr)))).length, 0, 'The response has unexpected attributes')
    });

    it('Should be a bad request (dni must be a number)', async() => {
      const { header_evaluador } = getHeaders();
      const dni = 'a'
      const res = await request(server)
        .get(`/api/usuarios/${dni}`)
        .set(header_evaluador)
        .expect(400);
      
      assert.equal((Object.keys(res.body).filter(attr => !(['error'].includes(attr)))).length, 0, 'The response has unexpected attributes')
    });

  })  
    
  describe('GET /api/usuarios/:id_usuario/proyectos ==> Get user projects', () => {

    const expectedAttributes = [
      'id_proyecto', 'id_evaluador', 'obligatoriedad_opinion',
      'id_modelo_encuesta', 'rol', 'fecha_inicio_eval', 'fecha_fin_eval',
      'fecha_fin_op', 'id', 'titulo', 'id_estado_eval', 'id_director',
      'id_institucion', 'FechaInicio', 'FechaFin', 'area_conocim',
      'subarea_conocim', 'problema_a_resolver', 'producto_a_generar',
      'resumen', 'novedad_u_originalidad', 'grado_relevancia',
      'grado_pertinencia', 'grado_demanda', 'fecha_carga', 'obligatoriedad_proposito'
    ];

    it('Should return all user projects', async() => {
      const { header_evaluador } = getHeaders();
      const id_usuario = 1
      const res = await request(server)
        .get(`/api/usuarios/${id_usuario}/proyectos`)
        .set(header_evaluador)
        .expect(200);
      
      const { proyectos } = res.body
          
      proyectos.forEach(proyecto => {
        const actualAttributes = Object.keys(proyecto);
        const unexpectedAttributes = actualAttributes.filter(attr => !expectedAttributes.includes(attr));
        assert.equal(unexpectedAttributes.length, 0, `Project object has unexpected attributes: ${unexpectedAttributes.join(', ')}`);
      })
    })

    it('Should be a bad request (id_usuario must be a number)', async() => {
      const { header_evaluador } = getHeaders();
      const id_usuario = 'a'
      const res = await request(server)
        .get(`/api/usuarios/${id_usuario}/proyectos`)
        .set(header_evaluador)
        .expect(400);
    
      assert.equal((Object.keys(res.body).filter(attr => !(['error'].includes(attr)))).length, 0, 'The response has unexpected attributes')
    });

  })
    

  describe('PUT /api/usuarios/:id_usuario ==> Update User', () => {

    const UserToUpdate = {
      user: {
        nombre: 'cambio de nombre' 
      }
    };

    it('Should update an existing user', async() => {
      const { header_evaluador } = getHeaders();
      const id_usuario = 1
      const res = await request(server)
        .put(`/api/usuarios/${id_usuario}`) 
        .set(header_evaluador)
        .send(UserToUpdate)
        .expect(200);
      
      const { usuario } = res.body
      const res2 = await request(server)
        .get(`/api/usuarios/${usuario.dni}`)
        .set(header_evaluador)
        .expect(200);
      
      const updatedResource = res2.body.usuario;
      assert.equal(updatedResource.nombre,usuario.nombre)
        
    });

    it('Should be a bad request (id_usuario must be a number)', async() => {
      const { header_evaluador } = getHeaders();
      const id_usuario = 'a'
      const res = await request(server)
        .put(`/api/usuarios/${id_usuario}`) 
        .set(header_evaluador)
        .send(UserToUpdate)
        .expect(400);
        
    });

    it('Should not let update the user (id_usuario dont match with the id_usuario from token)', async() => {
      const { header_evaluador } = getHeaders();
      
      const id_usuario = 455000
      const res = await request(server)
        .put(`/api/usuarios/${id_usuario}`) 
        .set(header_evaluador)
        .send(UserToUpdate)
        .expect(401);
        
    });

  })    
});