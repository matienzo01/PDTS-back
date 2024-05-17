import https from 'https'
import fs from 'fs';
import dotenv from 'dotenv'
dotenv.config();
import express from 'express'
import routerLogin from './routes/login';
import routerParametrosFormularios from './routes/parametrosFormularios'
import routerEval from './routes/eval';
import routerInstCYT from './routes/institutionCYT';
import routerInst from './routes/institution';
import routerUser from './routes/user';
import routerEncuesta from './routes/encuesta';
import cors from 'cors';

const app = express();
const PORT = 3000;
const privateKey = fs.readFileSync('certificados/seva-pdts.ar.key');
const certificate = fs.readFileSync('certificados/seva-pdts.ar.crt');
const credentials = { key: privateKey, cert: certificate };

app.use(express.json())
app.use(cors())

app.use('/api/login', routerLogin)
app.use('/api/parametros_forms', routerParametrosFormularios)
app.use('/api/evaluacion', routerEval)
app.use('/api/instituciones_cyt', routerInstCYT)
app.use('/api/instituciones', routerInst)
app.use('/api/usuarios', routerUser)
app.use('/api/encuesta', routerEncuesta)

const server = https.createServer(credentials, app);
server.listen(PORT, () => {
  console.log('funciona el server')
});

/*
const server = app.listen(PORT, () => {
  console.log('funciona el server')
})*/

module.exports = server
