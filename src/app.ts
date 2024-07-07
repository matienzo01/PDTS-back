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
import routerTest from './routes/test'
import routerTerritorio from './routes/territorio'
import routerProyectos from './routes/proyectos'
import cors from 'cors';
import https from 'https'
import http from 'http'
import fs from 'fs';

const app = express();

app.use(express.json())
app.use(cors())

app.use('/api', routerTest)
app.use('/api/login', routerLogin)
app.use('/api/parametros_forms', routerParametrosFormularios)
app.use('/api/evaluacion', routerEval)
app.use('/api/instituciones_cyt', routerInstCYT)
app.use('/api/instituciones', routerInst)
app.use('/api/usuarios', routerUser)
app.use('/api/encuesta', routerEncuesta)
app.use('/api/territorio', routerTerritorio)
app.use('/api/proyectos', routerProyectos)

const PORT = process.env.PORT_API

let server
if(process.env.MODE == 'DEV'){ //http
  server = http.createServer(app)
} else { //https
  const privateKey = fs.readFileSync('./certificados/seva-pdts.ar.key');
  const certificate = fs.readFileSync('./certificados/seva-pdts.ar.crt');
  const credentials = { key: privateKey, cert: certificate };
  server = https.createServer(credentials, app);
}

server.listen(PORT, () => {
  console.log(`Funciona el servidor en el puerto: ${PORT}`);
});

module.exports = server