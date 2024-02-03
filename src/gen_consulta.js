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

function select(tabla, columnas, condiciones, callback) {

    if (columnas == null) {columnas = '*'}
    let resultado = ''
    if (condiciones != null){
        resultado += 'WHERE '
        let atributos = Object.keys(condiciones)
        atributos.forEach( (atributo) => {
            resultado += atributo + ' = ' 
            let tipo = typeof condiciones[atributo]
            if (tipo === 'number' || tipo === 'boolean')
                resultado += condiciones[atributo] + ' AND ';
            else
                resultado += '"' +condiciones[atributo] + '"'+ ' AND ';
        })
        resultado = resultado.slice(0, -5);
    }
        
    let sql = `SELECT ${columnas} from ${tabla} ${resultado}`
    console.log(sql)

    database.consulta(sql,[], (err, resultados) => {
        if (err) {
            console.error('Error al realizar la inserción en la base de datos:', err);
            callback(err, null);
        } else {
            callback(null, resultados);
        }
    }) 
}

module.exports = {
    insert,
    select
}