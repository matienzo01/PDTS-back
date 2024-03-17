const request = require('supertest');
const server = require('../src/app');
const assert = require('assert');

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

function verifyAttributes(object, expected) {
    const actualAttributes = Object.keys(object);
    assert.equal(true, expected.every(element => actualAttributes.includes(element)), `The object should contain all the expected attributes`)
    const unexpectedAttributes = actualAttributes.filter(attr => !expected.includes(attr));
    assert.equal(unexpectedAttributes.length, 0, `Object has unexpected attributes: ${unexpectedAttributes.join(', ')}`);
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
    GET, POST, PUT, DELETE,
    verifyAttributes,
    verifyEvaluation
}