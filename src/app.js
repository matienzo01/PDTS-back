const express = require('express');
const database = require('./database');
const gen_consulta = require('./gen_consulta');
const app = express();
const PORT = 3000;

// prueba de un post a la tabla dimensiones
app.post('/dimensiones', (req, res) => {
  const body = { req }
  const params = Object.values(JSON.parse(body))
  const tabla = 'dimensiones(nombre,id_instancia)'
  gen_consulta._insert(tabla, params, (err, resultados) => {
    if (err) {
      res.status(400).json({ error: 'Bad request' });
    } else {
      res.status(200).json(resultados);
    }
  })
});

app.get('/dimensiones', (req, res) => {
  const tabla = 'dimensiones'
  gen_consulta._select(tabla, null, null, (err, resultados) => {
    if (err) {
      res.status(400).json({ error: 'Bad request' });
    } else {
      res.status(200).json(resultados);
    }
  })
});

app.get('/dimensiones/:id_instancia', (req, res) => {

  const condiciones = [`id_instancia = ${req.params.id_instancia.replace(/:/g, '')}`]
  const tabla = 'dimensiones'

  gen_consulta._select(tabla, null, condiciones, (err, resultados) => {
    if (err) {
      res.status(400).json({ error: 'Bad request' });
    } else {
      res.status(200).json(resultados);
    }
  })

})

app.delete('/dimensiones/:id', (req, res) => {

  const condiciones = [`id = ${req.params.id.replace(/:/g, '')}`]

  console.log(condiciones)
  const tabla = 'dimensiones'
  gen_consulta._delete(tabla, condiciones, (err, resultados) => {
    if (err) {
      res.status(400).json({ error: 'Bad request' });
    } else {
      res.status(200).json(resultados);
    }
  })
})

app.listen(PORT, () => {
  database.connect_BD()
  console.log(`La aplicación está escuchando en : http://localhost:${PORT}`);
});