const express = require('express');
const database = require('./database/database.js')
const routerParametrosFormularios = require('./routes/parametrosFormulariosRoutes.js')
const routerEval = require('./routes/evalRoutes.js')
const routerInst = require('./routes/institutionRoutes.js')
const routerParticipatingInst = require('./routes/participatingInstRoutes.js')
const cors = require('cors')

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json())
app.use(cors())
app.use('/api/parametros_forms', routerParametrosFormularios)
app.use('/api/evaluacion', routerEval)
app.use('/api/instituciones', routerInst)
app.use('/api/instituciones_participantes',routerParticipatingInst)

app.listen(PORT, () => {
  database.connect_BD()
  console.log('funciona el server')
})
