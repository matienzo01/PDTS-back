const request = require('supertest');
const server = require('../src/app'); // Importa tu aplicación Express aquí
const getHeaders = require('./LoginRoutes.test')
const assert = require('assert');

describe('TEST USER ROUTES', () => {
    
    it('GET /api/usuarios should return all users', (done) => {
        const { header_admin_general } = getHeaders();
        request(server)
          .get('/api/usuarios')
          .set(header_admin_general)
          .expect(200)
          .end((err, res) => {
            if (err) return done(err);
            const { usuarios } = res.body
            const expectedAttributes = [
                'id', 
                'email', 
                'dni', 
                'nombre', 
                'apellido', 
                'celular', 
                'especialidad', 
                'institucion_origen', 
                'pais_residencia', 
                'provincia_residencia', 
                'localidad_residencia', 
                'participaEn'
            ];
            usuarios.forEach(user => {
                const actualAttributes = Object.keys(user);
                const unexpectedAttributes = actualAttributes.filter(attr => !expectedAttributes.includes(attr));
                assert.equal(unexpectedAttributes.length, 0, `User object has unexpected attributes: ${unexpectedAttributes.join(', ')}`);
            });
            done();
          });
    });
    
    it('GET /api/usuarios/:dni should return one user', (done) => {
        const { header_evaluador } = getHeaders();
        const dni = 123456789
        request(server)
          .get(`/api/usuarios/${dni}`)
          .set(header_evaluador)
          .expect(200)
          .end((err, res) => {
            if (err) return done(err);
            const { usuario } = res.body
            const expectedAttributes = [
                'id', 
                'email', 
                'dni', 
                'nombre', 
                'apellido', 
                'celular', 
                'especialidad', 
                'institucion_origen', 
                'pais_residencia', 
                'provincia_residencia', 
                'localidad_residencia'
            ];
            const actualAttributes = Object.keys(usuario);
            const unexpectedAttributes = actualAttributes.filter(attr => !expectedAttributes.includes(attr));
            assert.equal(unexpectedAttributes.length, 0, `User object has unexpected attributes: ${unexpectedAttributes.join(', ')}`);

            done();
          });
    });
    
    it('GET /api/usuarios/:dni should not found an user', (done) => {
        const { header_evaluador } = getHeaders();
        const dni = 4
        request(server)
          .get(`/api/usuarios/${dni}`)
          .set(header_evaluador)
          .expect(404)
          .end((err, res) => {
            if (err) return done(err);
            done();
          });
    });
    
    it('GET /api/usuarios/:id_usuario/proyectos should return all user projects', (done) => {
        const { header_evaluador } = getHeaders();
        const id_usuario = 1
        request(server)
          .get(`/api/usuarios/${id_usuario}/proyectos`)
          .set(header_evaluador)
          .expect(200)
          .end((err, res) => {
            if (err) return done(err);
            const { proyectos } = res.body
            const expectedAttributes = [
                'id_proyecto', 
                'id_evaluador', 
                'obligatoriedad_opinion', 
                'id_modelo_encuesta', 
                'rol', 
                'fecha_inicio_eval', 
                'fecha_fin_eval', 
                'fecha_fin_op', 
                'id', 
                'titulo', 
                'id_estado_eval', 
                'id_director', 
                'id_institucion', 
                'FechaInicio', 
                'FechaFin', 
                'area_conocim', 
                'subarea_conocim', 
                'problema_a_resolver', 
                'producto_a_generar', 
                'resumen', 
                'novedad_u_originalidad', 
                'grado_relevancia', 
                'grado_pertinencia', 
                'grado_demanda', 
                'fecha_carga', 
                'obligatoriedad_proposito'
            ];
            proyectos.forEach(proyecto => {
                const actualAttributes = Object.keys(proyecto);
                const unexpectedAttributes = actualAttributes.filter(attr => !expectedAttributes.includes(attr));
                assert.equal(unexpectedAttributes.length, 0, `Project object has unexpected attributes: ${unexpectedAttributes.join(', ')}`);
            })
            done();
          });
    });
    
    it('PUT /api/usuarios/:id_usuario should update an existing user', (done) => {
        const { header_evaluador } = getHeaders();
        const UserToUpdate = {
            user: {
                nombre: 'cambio de nombre' 
                //email: 'aaa@gmail.com' no hago el update de esto pq sino se rompe el test (al re-ejecutarlo intento hacer previamente
                //un login con un mail diferente a este)
            }
        };
        const id_usuario = 1

        request(server)
          .put(`/api/usuarios/${id_usuario}`) 
          .set(header_evaluador)
          .send(UserToUpdate)
          .expect(200)
          .end((err, res) => {
            if (err) return done(err);
            const { usuario } = res.body
            request(server)
              .get(`/api/usuarios/${usuario.dni}`)
              .set(header_evaluador)
              .expect(200)
              .end((err, res) => {
                if (err) return done(err);
                const updatedResource = res.body.usuario;
                assert.equal(updatedResource.nombre,usuario.nombre)
                done();
              });
        });
    });

});