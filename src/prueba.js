const express = require('express');
const database = require('./database');
const gen_consulta = require('./gen_consulta');
const app = express();
const PORT = 3000;

app.delete('/dimensiones/:id', (req, res) => {
    let body = ''
    req.on('data', (chunk) => {
        body += chunk.toString();
    }).on('end', () => {
        
        let condiciones = [`id = ${req.params.id.replace(/:/g, '')}`]

        console.log(condiciones)
        let tabla = 'dimensiones'
        gen_consulta._delete(tabla,condiciones,(err,resultados) => {
            if (err) {
                res.status(400).json({ error: 'Bad request' });
            } else {
                res.status(200).json(resultados);
            }
        })
    })
})

app.listen(PORT, () => {
    database.conect_BD()
    console.log(`La aplicación está escuchando en : http://localhost:${PORT}`);
});