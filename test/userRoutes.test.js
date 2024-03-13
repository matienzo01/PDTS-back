const request = require('supertest');
const server = require('../src/app'); 
const getHeaders = require('./LoginRoutes.test')
const assert = require('assert');

describe('TEST USER ROUTES', () => {

  async function getAllUsers(header, statusCode) {
    const res = await request(server)
      .get(`/api/usuarios`)
      .set(header)
      .expect(statusCode)
    
    assert.equal(res.type, 'application/json')
    const usuarios = res.body.usuarios
    return usuarios
  }

  async function getOneUser(header, statusCode, dni) {
    const res = await request(server)
      .get(`/api/usuarios/${dni}`)
      .set(header)
      .expect(statusCode)

    assert.equal(res.type, 'application/json')
    const usuario = res.body.usuario
    return usuario
  }

  async function updateUser(header, statusCode, user, id_usuario) {
    const res = await request(server)
      .put(`/api/usuarios/${id_usuario}`) 
      .set(header)
      .send(user)
      .expect(statusCode);

    assert.equal(res.type, 'application/json')
    const usuario = res.body.usuario
    return usuario
  }

  async function getUserProjects(header, id_usuario, statusCode) {
    const res = await request(server)
      .get(`/api/usuarios/${id_usuario}/proyectos`)
      .set(header)
      .expect(statusCode);
    
    assert.equal(res.type, 'application/json')
    const proyectos = res.body.proyectos
    return proyectos
  }

  describe('GET /api/usuarios ==> Get all users', () => {

    const expectedAttributes = [
      'id', 'email', 'dni', 'nombre', 'apellido', 'celular', 'especialidad',
      'institucion_origen', 'pais_residencia', 'provincia_residencia',
      'localidad_residencia', 'participaEn'
    ];

    it('Should return all users', async() => {
      const { header_admin_general } = getHeaders();
      const usuarios = await getAllUsers(header_admin_general, 200)
      usuarios.forEach(user => {
        const actualAttributes = Object.keys(user);
        const unexpectedAttributes = actualAttributes.filter(attr => !expectedAttributes.includes(attr));
        assert.equal(unexpectedAttributes.length, 0, `User object has unexpected attributes: ${unexpectedAttributes.join(', ')}`);
      });    
    });

    it('Should be unauthorized for evaluators (status 403)', async() => {
      const { header_evaluador_1 } = getHeaders();
      await getAllUsers(header_evaluador_1, 403);
    });

    it('Should be unauthorized for adminscyt (status 403)', async() => {
      const { header_admincyt_1 } = getHeaders();
      await getAllUsers(header_admincyt_1, 403);
    });

  })

  describe('GET /api/usuarios/:dni ==> Get one user', () => { 
    
    const expectedAttributes = [
      'id', 'email', 'dni', 'nombre', 'apellido', 'celular', 'especialidad',
      'institucion_origen', 'pais_residencia', 'provincia_residencia',
      'localidad_residencia'
    ];

    it('Should return one user', async() => {
      const { header_evaluador_1 } = getHeaders();
      const dni = 123456789
      const usuario = await getOneUser(header_evaluador_1, 200, dni)
      const actualAttributes = Object.keys(usuario);
      const unexpectedAttributes = actualAttributes.filter(attr => !expectedAttributes.includes(attr));
      assert.equal(unexpectedAttributes.length, 0, `User object has unexpected attributes: ${unexpectedAttributes.join(', ')}`);
    });

    it('Should not found an user (status 404)', async() => {
      const { header_evaluador_1 } = getHeaders();
      const dni = 4
      await getOneUser(header_evaluador_1, 404, dni)
    });

    it('Should be a bad request (dni must be a number) (status 400)', async() => {
      const { header_evaluador_1 } = getHeaders();
      const dni = 'a'
      await getOneUser(header_evaluador_1, 400, dni)
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
      const { header_evaluador_1 } = getHeaders();
      const id_usuario = 1
      const proyectos = await getUserProjects(header_evaluador_1, id_usuario, 200)
          
      proyectos.forEach(proyecto => {
        const actualAttributes = Object.keys(proyecto);
        const unexpectedAttributes = actualAttributes.filter(attr => !expectedAttributes.includes(attr));
        assert.equal(unexpectedAttributes.length, 0, `Project object has unexpected attributes: ${unexpectedAttributes.join(', ')}`);
      })
    })

    it('Should be a bad request (id_usuario must be a number) (status 400)', async() => {
      const { header_evaluador_1 } = getHeaders();
      const id_usuario = 'a'
      await getUserProjects(header_evaluador_1, id_usuario, 400)
    });

  })
    
  describe('PUT /api/usuarios/:id_usuario ==> Update User', () => {

    const UserToUpdate = {
      user: {
        nombre: 'cambio de nombre' 
      }
    };

    it('Should update an existing user', async() => {
      const { header_evaluador_1 } = getHeaders();
      const id_usuario = 1
      const usuario = await updateUser(header_evaluador_1, 200, UserToUpdate, id_usuario)
      const updatedUser = await getOneUser(header_evaluador_1, 200, usuario.dni)
      assert.equal(updatedUser.nombre, usuario.nombre)
    });

    it('Should be a bad request (id_usuario must be a number) (status 400)', async() => {
      const { header_evaluador_1 } = getHeaders();
      const id_usuario = 'a'
      await updateUser(header_evaluador_1, 400, UserToUpdate, id_usuario)
    });

    it('Should not let update the user (id_usuario dont match with the id_usuario from token) (status 401)', async() => {
      const { header_evaluador_1 } = getHeaders();
      const id_usuario = 455000
      await updateUser(header_evaluador_1, 401, UserToUpdate, id_usuario)
        
    });

    it('Should be unauthorized for adminscyt (status 403)', async() => {
      const { header_admincyt_1 } = getHeaders();
      const id_usuario = 1
      await updateUser(header_admincyt_1, 403, UserToUpdate, id_usuario)
    });

    it('Should be unauthorized for admin general (status 403)', async() => {
      const { header_admin_general } = getHeaders();
      const id_usuario = 1
      await updateUser(header_admin_general, 403, UserToUpdate, id_usuario)
    });

  })    
});