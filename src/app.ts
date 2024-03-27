import dotenv from 'dotenv'
dotenv.config();
import express from 'express'
import routerLogin from './routes/login';
import routerParametrosFormularios from './routes/parametrosFormularios'
import routerEval from './routes/eval';/*
const routerInstCYT = require('./routes/institutionCYTRoutes.js')/*
const routerInst = require('./routes/institutionRoutes.js')/*
const routerUser = require('./routes/userRoutes.js')/*
const routerEncuesta = require('./routes/encuestaRoutes.js')*/
import cors from 'cors';
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json())
app.use(cors())

app.use('/api/login', routerLogin)
app.use('/api/parametros_forms', routerParametrosFormularios)
app.use('/api/evaluacion', routerEval)/*
app.use('/api/instituciones_cyt', routerInstCYT)/*
app.use('/api/instituciones', routerInst)/*
app.use('/api/usuarios', routerUser)/*
app.use('/api/encuesta', routerEncuesta)*/

const server = app.listen(PORT, () => {
  console.log('funciona el server')
})

module.exports = server
