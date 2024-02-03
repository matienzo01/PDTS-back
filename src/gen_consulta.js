const database = require('./database');

function _insert(tabla, params, callback) {
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

function _select(tabla, columnas, condiciones, callback) {
    if (columnas == null) {columnas = '*'}
    let resultado = (condiciones && `WHERE ${condiciones.join(' AND ')}`) ?? '';
    let sql = `SELECT ${columnas} FROM ${tabla} ${resultado}`

    database.consulta(sql,[], (err, resultados) => {
        if (err) {
            console.error('Error al realizar la consulta en la base de datos:', err);
            callback(err, null);
        } else {
            callback(null, resultados);
        }
    }) 
}

function _delete(tabla, condiciones, callback) {
    let resultado = (condiciones && `WHERE ${condiciones.join(' AND ')}`) ?? '';
    let sql = `DELETE FROM ${tabla} ${resultado}`

    database.consulta(sql,[], (err, resultados) => {
        if (err) {
            console.error('Error al realizar la eliminacion en la base de datos:', err);
            callback(err, null);
        } else {
            callback(null, resultados);
        }
    }) 
}

/*
function ejecuta_consulta(sql, params, callback){
    database.consulta(sql,[], (err, resultados) => {
        if (err) {
            console.error('Error al realizar la eliminacion en la base de datos:', err);
            callback(err, null);
        } else {
            callback(null, resultados);
        }
    }) 
}*/

module.exports = {
    _insert,
    _select,
    _delete
}