const request = require('supertest');
const server = require('../src/app');
const assert = require('assert');

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

function verifyAttributes(object, expected) {
    const actualAttributes = Object.keys(object);
    assert.equal(true, expected.every(element => actualAttributes.includes(element)))
    const unexpectedAttributes = actualAttributes.filter(attr => !expected.includes(attr));
    assert.equal(unexpectedAttributes.length, 0, `Object has unexpected attributes: ${unexpectedAttributes.join(', ')}`);
}

async function login(credentials, statusCode, expectedAttributes) {
    const res = await request(server)
      .post('/api/login')
      .send(credentials)
      .expect(statusCode)
      
    assert.equal(res.type, 'application/json')
    if (!res.body.error) {
        const { token, user } = res.body
        verifyAttributes(user, expectedAttributes)
        return { 'Authorization': `Bearer ${token}` }
    }
}

async function getEval(id_proyecto, header, statusCode) {
    const res = await request(server)
      .get(`/api/evaluacion/${id_proyecto}`)
      .set(header)
      .expect(statusCode)
    assert.equal(res.type, 'application/json')
    return res.body
}

async function getAnswers(id_proyecto, header, statusCode) {
    const res = await request(server)
      .get(`/api/evaluacion/${id_proyecto}/respuestas`)
      .set(header)
      .expect(statusCode)
    assert.equal(res.type, 'application/json')
    return res.body
}

async function getPdf(id_proyecto, header, statusCode, type) {
    const res = await request(server)
      .get(`/api/evaluacion/${id_proyecto}/respuestas/pdf`)
      .set(header)
      .expect(statusCode)
    return res
}

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

async function getInstitutionsCYT(header, statusCode)  {
    const res = await request(server)
      .get(`/api/instituciones_cyt`)
      .set(header)
      .expect(statusCode)
    assert.equal(res.type, 'application/json')
    return res.body
}

module.exports = {
    getAllUsers,
    getOneUser,
    updateUser,
    getUserProjects,
    verifyAttributes,
    login,
    getEval,
    getAnswers,
    getPdf,
    getOneInstitutions,
    getAllInstitutions,
    createInstitution,
    getInstitutionsCYT
}