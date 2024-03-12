const request = require('supertest');
const server = require('../src/app'); 
const assert = require('assert');

let headers = {}

describe('TEST LOGIN ROUTES', () => {
  
  async function login(credentials, statusCode, headerKey, expectedAttributes) {
    return await request(server)
      .post('/api/login')
      .send(credentials)
      .expect(statusCode)
      .then(response => {
        if (!response.body.error) {
          const { token, user } = response.body
          headers[headerKey] = { 'Authorization': `Bearer ${token}` }
          const actualAttributes = Object.keys(user);
          const unexpectedAttributes = actualAttributes.filter(attr => !expectedAttributes.includes(attr));
          assert.equal(unexpectedAttributes.length, 0, `User object has unexpected attributes: ${unexpectedAttributes.join(', ')}`);
        }
      })
  }

  describe("POST /api/login ==> Login", () => {

    const successfulLoginTests = [
      {
        description: 'evaluador 1',
        credentials: { mail: 'evaluador1@example.com', password: '1234' },
        expectedAttributes: ['id', 'mail', 'rol', 'nombre', 'apellido'],
        headerKey: 'header_evaluador_1'
      },
      {
        description: 'evaluador 2',
        credentials: { mail: 'evaluador2@example.com', password: '1234' },
        expectedAttributes: ['id', 'mail', 'rol', 'nombre', 'apellido'],
        headerKey: 'header_evaluador_2'
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
        await login(testCase.credentials,200,testCase.headerKey, testCase.expectedAttributes)
      });
    });
    
    it('Should fail with incorrect credentials (status 401)', async() => {
      credentials = { 
        mail: 'evaluador1@example.com', 
        password: '12345'
      }
      await login(credentials,401)
    });

    it('Should fail with missing credentials (status 400)', async() => {
      credentials = { mail: 'evaluador1@example.com' }
      await login(credentials,400)
    });

  })

})
  
  

module.exports = () => headers