const mysql = require('mysql');

// Configuración de la conexión a la base de datos
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'pdts'
});

function conect_BD() {
  connection.connect((err) => {
    if (err) {
      console.error('Error de conexión a la base de datos:', err);
      return;
    }
    console.log('Conectado a la base de datos MySQL');
  })
}

function consulta(sql, values, callback) {
  connection.query(sql, values, (err, resultados, campos) => {
    //callback(err ? err : null, err ? null : resultados)
    if (err) {
      console.error('Error al realizar la consulta:', err);
      // Llamamos al callback con el error para que sea manejado en el lugar que llama a esta función
      callback(err, null);
    } else {
      callback(null, resultados);
    }
  });
}

module.exports = {
  conect_BD,
  consulta
};