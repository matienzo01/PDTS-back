const request = require('supertest');
const server = require('../src/app'); 
const assert = require('assert');

let headers = {}

describe('TEST LOGIN', () => {

  it('POST /api/login should login successfully with correct credentials (evaluador 1)', (done) => {

    const credentials = { 
        mail: 'evaluador1@example.com', 
        password: '1234' 
    };

    const expectedAttributes = ['id', 'mail', 'rol', 'nombre', 'apellido'];

    request(server)
      .post('/api/login')
      .send(credentials)
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        const { token, user } = res.body;
        const actualAttributes = Object.keys(user);
        const unexpectedAttributes = actualAttributes.filter(attr => !expectedAttributes.includes(attr));
        assert.equal(unexpectedAttributes.length, 0, `User object has unexpected attributes: ${unexpectedAttributes.join(', ')}`);
        headers.header_evaluador = { 'Authorization': `Bearer ${token}`}
        done();
      });
  });

  it('POST /api/login should login successfully with correct credentials (admin cyt)', (done) => {

    const credentials = { 
        mail: 'admin1@mail.com', 
        password: '1234' 
    };
    const expectedAttributes = ['id', 'mail', 'rol', 'institutionId'];

    request(server)
      .post('/api/login')
      .send(credentials)
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        const { token, user } = res.body;
        const actualAttributes = Object.keys(user);
        const unexpectedAttributes = actualAttributes.filter(attr => !expectedAttributes.includes(attr));
        assert.equal(unexpectedAttributes.length, 0, `User object has unexpected attributes: ${unexpectedAttributes.join(', ')}`);
        headers.header_admincyt= { 'Authorization': `Bearer ${token}`}
        done();
      });
  });

  it('POST /api/login should login successfully with correct credentials (admin general)', (done) => {

    const credentials = { 
        mail: 'admin@mail.com', 
        password: '1234' 
    };
    const expectedAttributes = ['id', 'mail', 'rol'];

    request(server)
      .post('/api/login')
      .send(credentials)
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        const { token, user } = res.body;
        const actualAttributes = Object.keys(user);
        const unexpectedAttributes = actualAttributes.filter(attr => !expectedAttributes.includes(attr));
        assert.equal(unexpectedAttributes.length, 0, `User object has unexpected attributes: ${unexpectedAttributes.join(', ')}`);
        headers.header_admin_general = { 'Authorization': `Bearer ${token}`}
        done();
      });
  });

  it('POST /api/login should fail with incorrect credentials', (done) => {
    const credentials = { 
        mail: 'evaluador1@example.com', 
        password: '12345' 
    };
    request(server)
      .post('/api/login')
      .send(credentials)
      .expect(401)
      .end((err, res) => {
        if (err) return done(err);
        done();
      });
  });

});

module.exports = () => headers