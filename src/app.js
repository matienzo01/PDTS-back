const express = require('express');
const database = require('./database/database.js')
const routerDimensiones = require('./routes/rutas_dimensiones.js')

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json())
app.use('/api/dimensiones', routerDimensiones)

app.listen(PORT, () => {
  database.connect_BD()
  console.log('funciona el server')
})
