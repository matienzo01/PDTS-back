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

module.exports = {
    GET, POST, PUT, DELETE,
    verifyAttributes
}