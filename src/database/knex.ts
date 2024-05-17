import Knex from 'knex';

// para conectarse a la base de datos de manera remota
/*
const knex = Knex({
  client: 'mysql',
  connection: {
    port: 3306,
    host: '179.43.115.86',
    user: 'seva',
    password: '20ProySe-va24',
    database: 'seva-pdts'
  }
});*/

// este debería ser el que se use definitivamente
const knex = Knex({
  client: 'mysql',
  connection: {
    port: 3306,
    host: 'localhost',
    user: 'seva',
    password: '20ProySe-va24',
    database: 'seva-pdts'
  }
});

/* para conectarse con la base de datos localmente
const knex = Knex({
  client: 'mysql',
  connection: {
    port: 3306,
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'pdts'
  }
});*/


export default knex;
