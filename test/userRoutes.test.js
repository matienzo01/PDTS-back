const Requests = require('./Requests.js')
const getHeaders = require('./LoginRoutes.test.js')
const assert = require('assert');

describe('TEST USER ROUTES', () => {

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

  describe('GET /api/usuarios ==> Get all users', () => {

  const { expectedAttributes } = require('./jsons/userAttributes1.json')

    it('Should return all users', async() => {
      const res = await Requests.GET(`/api/usuarios`, header_admin_general, 200)
      const { usuarios } = res.body
      usuarios.forEach(user => {
        Requests.verifyAttributes(user, expectedAttributes)
      });    
    });

    it('Should be unauthorized for evaluators (status 403)', async() => {
      await Requests.GET(`/api/usuarios`, header_evaluador_1, 403)
    });

    it('Should be unauthorized for adminscyt (status 403)', async() => {
      await Requests.GET(`/api/usuarios`, header_admincyt_1, 403)
    });

  })

  describe('GET /api/usuarios/:dni ==> Get one user', () => { 
    
    const {expectedAttributes} = require('./jsons/userAttributes2.json'); //no tiene el participaEn

    it('Should return one user', async() => {
      const dni = 123456789
      const res = await Requests.GET(`/api/usuarios/${dni}`, header_evaluador_1, 200)
      const { usuario } = res.body
      Requests.verifyAttributes(usuario, expectedAttributes)
    });

    it('Should not found an user (status 404)', async() => {
      const dni = 4
      await Requests.GET(`/api/usuarios/${dni}`, header_evaluador_1, 404)
    });

    it('Should be a bad request (dni must be a number) (status 400)', async() => {
      const dni = 'a'
      await Requests.GET(`/api/usuarios/${dni}`, header_evaluador_1, 400)
    });

  })  
    
  describe('GET /api/usuarios/:id_usuario/proyectos ==> Get user projects', () => {

    const { expectedAttributes } = require('./jsons/ProjectAttributes.json');

    it('Should return all user projects', async() => {
      const id_usuario = 1
      const res = await Requests.GET(`/api/usuarios/${id_usuario}/proyectos`, header_evaluador_1, 200)
      const { proyectos } = res.body
          
      proyectos.forEach(proyecto => {
        Requests.verifyAttributes(proyecto, expectedAttributes)
      })
    })

    it('Should be a bad request (id_usuario must be a number) (status 400)', async() => {
      const id_usuario = 'a'
      await Requests.GET(`/api/usuarios/${id_usuario}/proyectos`, header_evaluador_1, 400)
    });

  })
    
  describe('PUT /api/usuarios/:id_usuario ==> Update User', () => {

    const UserToUpdate = require('./jsons/UserToUpdate.json')
    
    it('Should update an existing user', async() => {
      const id_usuario = 1

      const res1 = await Requests.PUT(`/api/usuarios/${id_usuario}`, header_evaluador_1, 200, UserToUpdate)
      const { usuario } = res1.body
      const res2 = await Requests.GET(`/api/usuarios/${usuario.dni}`, header_evaluador_1, 200)
      const updatedUser = res2.body.usuario
      assert.equal(updatedUser.nombre, usuario.nombre)
    });

    it('Should be a bad request (id_usuario must be a number) (status 400)', async() => {
      const id_usuario = 'a'
      await Requests.PUT(`/api/usuarios/${id_usuario}`, header_evaluador_1, 400, UserToUpdate)
    });

    it('Should not let update the user (id_usuario dont match with the id_usuario from token) (status 401)', async() => {
      const id_usuario = 455000
      await Requests.PUT(`/api/usuarios/${id_usuario}`, header_evaluador_1, 401, UserToUpdate)
    });

    it('Should be unauthorized for adminscyt (status 403)', async() => {
      const id_usuario = 1
      await Requests.PUT(`/api/usuarios/${id_usuario}`, header_admincyt_1, 403, UserToUpdate)
    });

    it('Should be unauthorized for admin general (status 403)', async() => {
      const id_usuario = 1
      await Requests.PUT(`/api/usuarios/${id_usuario}`, header_admin_general, 403, UserToUpdate)
    });

  })    
});