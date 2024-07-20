const request = require('supertest');
const server = require('../dist/app');
const assert = require('assert');
const fs = require('fs');

async function GET(route, header, status, type = 'application/json') {
  const res = await request(server)
    .get(route)
    .set(header)
    .expect(status)
  
  assert.equal(res.type, type)
  return res
}

async function POST(route, header, status, data, type = 'application/json') {
  const requestToSend = request(server)
    .post(route)
    .send(data)
    .set(header !== null ? header : {})
    .expect(status);
  const res = await requestToSend;

  assert.equal(res.type, type)
  return res
}

async function POSTFormData(route, header, status, filePath, data, dataName, type = 'application/json') {
  const requestToSend = request(server)
    .post(route)
    .set(header !== null ? header : {})
    .field(dataName, JSON.stringify(data))
    .attach('file', fs.createReadStream(filePath))
    .expect(status);
  
  const res = await requestToSend;
  assert.equal(res.type, type)
  return res
}

async function PUT(route, header, status, data, type = 'application/json')  {
  const res = await request(server)
    .put(route)
    .send(data)
    .set(header)
    .expect(status)

  assert.equal(res.type, type)
  return res
}

async function DELETE(route, header, status) {
  const res = await request(server)
    .delete(route)
    .set(header)
    .expect(status)
  
  return res
}

function verifyAttributes(name, object, expected) {
  const actualAttributes = Object.keys(object);
  const missingAttributes = expected.filter(attr => !actualAttributes.includes(attr));
  assert.equal(missingAttributes.length, 0, `${name} is missing the following expected attributes: ${missingAttributes.join(', ')}`);
  const unexpectedAttributes = actualAttributes.filter(attr => !expected.includes(attr));
  assert.equal(unexpectedAttributes.length, 0, `${name} has unexpected attributes: ${unexpectedAttributes.join(', ')}`);
}

function verifyProperties(obj, props){
  for (const prop of props) {
    assert.ok(obj.hasOwnProperty(prop));
  }
}

function verifyEvaluation(eval){
  assert.ok(eval.hasOwnProperty('respuestas'));
  const { respuestas } = eval;
  verifyRespuestas(respuestas);
}

function verifyRespuestas(respuestas) {
  verifyProperties(respuestas, ['name', 'sections']);
  const { sections } = respuestas;
  verifyProperties(sections, ['Entidad', 'Proposito']);

  const { Entidad, Proposito } = sections;
  verifyProperties(Entidad, ['opciones_instancia', 'dimensiones']);
  verifyProperties(Proposito, ['opciones_instancia', 'dimensiones']);

  verifyDimensiones(Entidad.dimensiones);
  verifyDimensiones(Proposito.dimensiones);
}

function verifyDimensiones(dimensiones) {
  dimensiones.forEach((dim) => {
    verifyProperties(dim, ['id_dimension', 'nombre', 'indicadores']);
    dim.indicadores.forEach((ind) => {
      verifyProperties(ind, ['id_indicador', 'indicador', 'fundamentacion', 'determinante', 'respuestas']);
      ind.respuestas.forEach((rta) => {
        verifyProperties(rta, ['id_evaluador', 'option', 'value']);
      });
    });
  });
}

module.exports = {
    GET, POST, PUT, DELETE, POSTFormData,
    verifyAttributes,
    verifyEvaluation
}