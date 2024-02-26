require('dotenv').config();
const express = require('express');
const routerParametrosFormularios = require('./routes/parametrosFormulariosRoutes.js')
const routerEval = require('./routes/evalRoutes.js')
const routerInstCYT = require('./routes/institutionCYTRoutes.js')
const routerInst = require('./routes/institutionRoutes.js')
const routerLogin = require('./routes/LoginRoutes.js')
const routerUser = require('./routes/userRoutes.js')
const cors = require('cors')
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json())
app.use(cors())

app.use('/api/login', routerLogin)
app.use('/api/parametros_forms', routerParametrosFormularios)
app.use('/api/evaluacion', routerEval)
app.use('/api/instituciones_cyt', routerInstCYT)
app.use('/api/instituciones', routerInst)
app.use('/api/usuarios', routerUser)

app.listen(PORT, () => {
  console.log('funciona el server')
})
