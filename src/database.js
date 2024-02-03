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
  console.log(sql)
  connection.query(sql, values, (err, resultados, campos) => {
    if (err) {
      console.error('Error al realizar la consulta:', err);
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