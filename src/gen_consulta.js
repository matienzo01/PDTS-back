const database = require('./database');

function insert(tabla, params, callback) {
    let a = `(${Array(params.length).fill('?').join(',')})`
    let sql = `INSERT INTO ${tabla} VALUES ${a}`
    
    database.consulta(sql,params, (err, resultados) => {
        if (err) {
            console.error('Error al realizar la inserción en la base de datos:', err);
            callback(err, null);
        } else {
            callback(null, resultados);
        }
    })
    
}

module.exports = {
    insert
}