const request = require('supertest');
const server = require('../src/app'); 
const assert = require('assert');

let headers = {}

describe('TEST LOGIN ROUTES', () => {
  
  describe("POST /api/login ==> Login", () => {

    const successfulLoginTests = [
      {
        description: 'evaluador 1',
        credentials: { mail: 'evaluador1@example.com', password: '1234' },
        expectedAttributes: ['id', 'mail', 'rol', 'nombre', 'apellido'],
        headerKey: 'header_evaluador'
      },
      {
        description: 'admin cyt',
        credentials: { mail: 'admin1@mail.com', password: '1234' },
        expectedAttributes: ['id', 'mail', 'rol', 'institutionId'],
        headerKey: 'header_admincyt'
      },
      {
        description: 'admin general',
        credentials: { mail: 'admin@mail.com', password: '1234' },
        expectedAttributes: ['id', 'mail', 'rol'],
        headerKey: 'header_admin_general'
      }
    ];

    successfulLoginTests.forEach(testCase => {
      it(`Should login successfully with correct credentials (${testCase.description})`, async() => {
        const res = await request(server)
          .post('/api/login')
          .send(testCase.credentials)
          .expect(200);
          
        const { token, user } = res.body;
        const actualAttributes = Object.keys(user);
        const unexpectedAttributes = actualAttributes.filter(attr => !testCase.expectedAttributes.includes(attr));
        assert.equal(unexpectedAttributes.length, 0, `User object has unexpected attributes: ${unexpectedAttributes.join(', ')}`);
        headers[testCase.headerKey] = { 'Authorization': `Bearer ${token}`};
      });
    });
    
    it('Should fail with incorrect credentials', async() => {
      await request(server)
        .post('/api/login')
        .send({ 
          mail: 'evaluador1@example.com', 
          password: '12345' 
        })
        .expect(401);
    });

    it('Should fail with missing credentials', async() => {
      await request(server)
        .post('/api/login')
        .send({ 
          mail: 'evaluador1@example.com'
        })
        .expect(400);
    });

  })

})
  
  

module.exports = () => headers