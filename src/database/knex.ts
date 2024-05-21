import Knex from 'knex';

/*
// para conectarse a la base de datos de manera remota
const knex = Knex({
  client: 'mysql',
  connection: {
    port: 3306,
    host: 'vps-4116920-x.dattaweb.com',
    user: 'seva',
    password: 'vj@kegW1eV',
    database: 'seva_pdts_prueba'
  }
});
*/

// este debería ser el que se use definitivamente
/*
const knex = Knex({
  client: 'mysql',
  connection: {
    host: 'localhost',
    user: 'seva_pdts',
    password: 'vj@kegW1eV',
    database: 'seva_pdts'
  }
});
*/


//para conectarse con la base de datos localmente
const knex = Knex({
  client: 'mysql',
  connection: {
    port: 3306,
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'pdts'
  }
});


export default knex;
