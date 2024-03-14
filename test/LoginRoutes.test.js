const assert = require('assert');
const Requests = require('./Requests.js')

let headers = {}
const { successfulLoginTests } = require('./jsons/succesfullLoginTests.json');
const { unsuccessfulLoginTests } = require('./jsons/unsuccesfulLoginTests.json');

describe('TEST LOGIN ROUTES', () => {
  
  describe("POST /api/login ==> Login", () => {

    successfulLoginTests.forEach(testCase => {
      it(`Should login successfully with correct credentials (${testCase.description})`, async() => {
        const res = await Requests.POST('/api/login', null, 200, testCase.credentials)
        const { token, user } = res.body
        Requests.verifyAttributes(user, testCase.expectedAttributes)
        headers[testCase.headerKey] = { 'Authorization': `Bearer ${token}` }
      });
    });
    

    unsuccessfulLoginTests.forEach(testCase => {
      it(testCase.msg, async() => {
        const res = await Requests.POST('/api/login', null, testCase.status, testCase.credentials)
        assert.equal(true, res.body.hasOwnProperty('error'))
      })
    })

  })

})
  
  
module.exports = () => headers