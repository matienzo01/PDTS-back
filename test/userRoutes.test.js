const Requests = require('./Requests.js')
const getHeaders = require('./LoginRoutes.test')
const assert = require('assert');

const {expectedAttributes} = require('./jsons/userAttributes.json');

describe('TEST USER ROUTES', () => {

  describe('GET /api/usuarios ==> Get all users', () => {

    it('Should return all users', async() => {
      const { header_admin_general } = getHeaders();
      const usuarios = await Requests.getAllUsers(header_admin_general, 200)
      usuarios.forEach(user => {
        Requests.verifyAttributes(user, expectedAttributes)
      });    
    });

    it('Should be unauthorized for evaluators (status 403)', async() => {
      const { header_evaluador_1 } = getHeaders();
      await Requests.getAllUsers(header_evaluador_1, 403);
    });

    it('Should be unauthorized for adminscyt (status 403)', async() => {
      const { header_admincyt_1 } = getHeaders();
      await Requests.getAllUsers(header_admincyt_1, 403);
    });

  })

  describe('GET /api/usuarios/:dni ==> Get one user', () => { 

    it('Should return one user', async() => {
      const { header_evaluador_1 } = getHeaders();
      const dni = 123456789
      const usuario = await Requests.getOneUser(header_evaluador_1, 200, dni)
      expectedAttributes.pop() //elimino el 'participaEn'
      Requests.verifyAttributes(usuario, expectedAttributes)
    });

    it('Should not found an user (status 404)', async() => {
      const { header_evaluador_1 } = getHeaders();
      const dni = 4
      await Requests.getOneUser(header_evaluador_1, 404, dni)
    });

    it('Should be a bad request (dni must be a number) (status 400)', async() => {
      const { header_evaluador_1 } = getHeaders();
      const dni = 'a'
      await Requests.getOneUser(header_evaluador_1, 400, dni)
    });

  })  
    
  describe('GET /api/usuarios/:id_usuario/proyectos ==> Get user projects', () => {

    const { expectedAttributes } = require('./jsons/ProjectAttributes.json');

    it('Should return all user projects', async() => {
      const { header_evaluador_1 } = getHeaders();
      const id_usuario = 1
      const proyectos = await Requests.getUserProjects(header_evaluador_1, id_usuario, 200)
          
      proyectos.forEach(proyecto => {
        Requests.verifyAttributes(proyecto, expectedAttributes)
      })
    })

    it('Should be a bad request (id_usuario must be a number) (status 400)', async() => {
      const { header_evaluador_1 } = getHeaders();
      const id_usuario = 'a'
      await Requests.getUserProjects(header_evaluador_1, id_usuario, 400)
    });

  })
    
  describe('PUT /api/usuarios/:id_usuario ==> Update User', () => {

    const UserToUpdate = require('./jsons/UserToUpdate.json')

    it('Should update an existing user', async() => {
      const { header_evaluador_1 } = getHeaders();
      const id_usuario = 1
      const usuario = await Requests.updateUser(header_evaluador_1, 200, UserToUpdate, id_usuario)
      const updatedUser = await Requests.getOneUser(header_evaluador_1, 200, usuario.dni)
      assert.equal(updatedUser.nombre, usuario.nombre)
    });

    it('Should be a bad request (id_usuario must be a number) (status 400)', async() => {
      const { header_evaluador_1 } = getHeaders();
      const id_usuario = 'a'
      await Requests.updateUser(header_evaluador_1, 400, UserToUpdate, id_usuario)
    });

    it('Should not let update the user (id_usuario dont match with the id_usuario from token) (status 401)', async() => {
      const { header_evaluador_1 } = getHeaders();
      const id_usuario = 455000
      await Requests.updateUser(header_evaluador_1, 401, UserToUpdate, id_usuario)
    });

    it('Should be unauthorized for adminscyt (status 403)', async() => {
      const { header_admincyt_1 } = getHeaders();
      const id_usuario = 1
      await Requests.updateUser(header_admincyt_1, 403, UserToUpdate, id_usuario)
    });

    it('Should be unauthorized for admin general (status 403)', async() => {
      const { header_admin_general } = getHeaders();
      const id_usuario = 1
      await Requests.updateUser(header_admin_general, 403, UserToUpdate, id_usuario)
    });

  })    
});