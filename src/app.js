const express = require('express');
const database = require('./database/database.js')
const routerParametrosFormularios = require('./routes/parametrosFormulariosRoutes.js')
const routerEval = require('./routes/evalRoutes.js')
const routerInstCYT = require('./routes/institutionCYTRoutes.js')
const routerInst = require('./routes/institutionRoutes.js')
const cors = require('cors')

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json())
app.use(cors())
app.use('/api/parametros_forms', routerParametrosFormularios)
app.use('/api/evaluacion', routerEval)
app.use('/api/instituciones_cyt', routerInstCYT)
app.use('/api/instituciones',routerInst)

app.listen(PORT, () => {
  database.connect_BD()
  console.log('funciona el server')
})
