import Knex from 'knex';


const knex = Knex({
  client: 'mysql',
  connection: {
    port: 3306,
    host: 'seva-pdts.ar',
    user: 'seva',
    password: '20ProySe-va24',
    database: 'seva-pdts'
  }
});


/*
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
