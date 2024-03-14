const Requests = require('./Requests.js')

let headers = {}
const { successfulLoginTests } = require('./jsons/succesfullLoginTests.json');
const { unsuccessfulLoginTests } = require('./jsons/unsuccesfulLoginTests.json');

describe('TEST LOGIN ROUTES', () => {
  
  describe("POST /api/login ==> Login", () => {

    successfulLoginTests.forEach(testCase => {
      it(`Should login successfully with correct credentials (${testCase.description})`, async() => {
        headers[testCase.headerKey] = await Requests.login(testCase.credentials,200, testCase.expectedAttributes)
      });
    });
    

    unsuccessfulLoginTests.forEach(testCase => {
      it(testCase.msg, async() => {
        await Requests.login(testCase.credentials, testCase.status, testCase.status, ["error"])
      })
    })

  })

})
  
  
module.exports = () => headers