const database = require('./database');

function _insert(tabla, params) {
    return new Promise((resolve, reject) => {
        let a 
        if (!params.every(item => Array.isArray(item))){
            a = `(${Array(params.length).fill('?').join(',')})`
        } else {
            const substring = '(?)'
            const stringsRepetidos = params.map( () => substring)
            a = stringsRepetidos.join(',')
        }
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

function _call(procedure) {
    return new Promise((resolve, reject) => {
        const sql = `CALL ${procedure}()`
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

function _update(tabla, params, set, condiciones){
    return new Promise((resolve,reject) => {
        const resultado = (condiciones && `WHERE ${condiciones.join(' AND ')}`) ?? '';
        const sql = `UPDATE ${tabla} SET ${set} ${resultado}`
        database.consulta(sql,params, (err, resultados) => {
            if (err) {
                console.error('Error al realizar la actualizacion en la base de datos:', err);
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
    _delete,
    _call,
    _update
}