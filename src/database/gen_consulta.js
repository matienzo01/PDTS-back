const database = require('./database');

function _insert(tabla, params) {
    return new Promise((resolve, reject) => {
        const a = `(${Array(params.length).fill('?').join(',')})`
        const sql = `INSERT INTO ${tabla} VALUES ${a}`
        database.consulta(sql,params, (err, resultados) => {
            if (err) {
                console.error('Error al realizar la inserción en la base de datos:', err);
                reject(err);
            } else {
                resolve(resultados);
            }
        }) 
    })
      
}

function _select(tabla, columnas, condiciones) {
    return new Promise((resolve, reject) => {
        if (columnas == null) {columnas = '*'}
        const resultado = (condiciones && `WHERE ${condiciones.join(' AND ')}`) ?? '';
        const sql = `SELECT ${columnas} FROM ${tabla} ${resultado}`

        database.consulta(sql, [], (err, resultados) => {
            if (err) {
                console.error('Error al realizar la consulta en la base de datos:', err);
                reject(err);
            } else {
                resolve(resultados);
            }
        });
    })
}

function _delete(tabla, condiciones) {
    return new Promise((resolve, reject) => {
        const resultado = (condiciones && `WHERE ${condiciones.join(' AND ')}`) ?? '';
        const sql = `DELETE FROM ${tabla} ${resultado}`

        database.consulta(sql,[], (err, resultados) => {
            if (err) {
                console.error('Error al realizar la eliminacion en la base de datos:', err);
                reject(err);
            } else {
                resolve(resultados);
            }
        }) 
    })
}

module.exports = {
    _insert,
    _select,
    _delete
}