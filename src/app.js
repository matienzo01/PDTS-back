const express = require('express');
const database = require('./database/database.js')
const routerDimensiones = require('./routes/rutas_dimensiones.js')
const routerEvaluacion = require('./routes/rutas_evaluacion.js')
const cors = require('cors')

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json())
app.use(cors())
app.use('/api/dimensiones', routerDimensiones)
app.use('/api/evaluacion', routerEvaluacion)

app.listen(PORT, () => {
  database.connect_BD()
  console.log('funciona el server')
})
