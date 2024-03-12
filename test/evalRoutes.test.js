const request = require('supertest');
const server = require('../src/app'); // Importa tu aplicación Express aquí
const getHeaders = require('./LoginRoutes.test')
const assert = require('assert');

describe('TEST EVAL ROUTES', () => {

    describe('GET /api/evaluacion/:id_proyecto ==> Get next eval', () => {
    
    })

    describe('GET /api/evaluacion/:id_proyecto/respuestas ==> Get eval project answers', () => {
    
    })

    describe('GET /api/evaluacion/:id_proyecto/respuestas/pdf ==> Get a pdf with a project evaluation summary', () => {
    
    })

    describe('POST /api/evaluacion ==> Post the responses of an evaluator for a project', () => {
    
    })
    
})